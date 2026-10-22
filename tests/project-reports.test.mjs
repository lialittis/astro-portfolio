import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { synchronizeProjectReports, validateReportAssets } from '../scripts/sync-project-reports.mjs'
import {
  assetPath, loadProjectManifests, loadReportSnapshot, projectManifestSchema,
  projectResourceRoutes, readReportLock, renderProjectReport, snapshotPath
} from '../src/lib/project-reports.mjs'

const commit = 'a'.repeat(40)
const html = '<!doctype html><html><head><title>Replay &amp; results</title><style>body { color: red }</style></head><body class="report"><h1>Replay results</h1><a href="#results">Results</a><section id="results"></section><script>window.reportReady = true</script></body></html>'
const manifest = () => ({
  slug: 'gpu-study', repository: 'example/gpu', ref: 'main', studies: [
    { slug: 'streams', title: 'Streams', description: 'Concurrency experiments.', technologies: ['CUDA'], sourcePath: '01-streams' },
    { slug: 'graph-errors', title: 'Graph errors', description: 'Numerical errors and fixes.', technologies: ['PyTorch'], sourcePath: '02-graphs', report: { entry: '02-graphs/explainer.html', assets: [] } }
  ]
})

async function workspace(t, data = manifest()) {
  const root = await mkdtemp(path.join(tmpdir(), 'project-report-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await saveManifest(root, data)
  return root
}

async function saveManifest(root, data) {
  const directory = path.join(root, 'src/data/project-studies')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, `${data.slug}.json`), JSON.stringify(data))
}

function source({ document = html, files = {}, date = '2026-10-19T12:00:00Z', fail = '' } = {}) {
  const urls = []
  const fetcher = async url => {
    urls.push(url)
    if (fail && url.includes(fail)) return new Response('Failed', { status: 503 })
    if (url.includes('/commits?')) return Response.json([{ commit: { committer: { date } } }])
    if (url.includes('/commits/')) return Response.json({ sha: commit })
    if (url.endsWith('/02-graphs/explainer.html')) return new Response(document)
    const file = Object.entries(files).find(([name]) => url.endsWith('/02-graphs/' + name))
    if (file) return new Response(file[1])
    return new Response('Not found', { status: 404 })
  }
  return { fetcher, urls }
}

test('only selected report studies get local report routes', () => {
  assert.deepEqual(projectResourceRoutes([manifest()]), ['/project/gpu-study', '/project/gpu-study/graph-errors'])
})

test('manifests reject unsafe paths, reserved asset names, and duplicate study slugs', () => {
  for (const invalid of ['../outside', '/absolute', 'folder/../../outside', 'a\\b']) {
    const data = manifest()
    data.studies[1].report.assets = [invalid]
    assert.equal(projectManifestSchema.safeParse(data).success, false)
    assert.throws(() => assetPath('/tmp/test', 'gpu-study', 'graph-errors', invalid))
  }
  const reserved = manifest()
  reserved.studies[1].report.assets = ['index.html']
  assert.equal(projectManifestSchema.safeParse(reserved).success, false)
  const duplicate = manifest()
  duplicate.studies[1].slug = duplicate.studies[0].slug
  assert.equal(projectManifestSchema.safeParse(duplicate).success, false)
})

test('report imports resolve a branch once and fetch all content at the exact commit', async t => {
  const root = await workspace(t)
  const remote = source()
  const result = await synchronizeProjectReports('gpu-study', { root, fetcher: remote.fetcher })
  assert.deepEqual(result, { commit, reports: 1 })
  assert(remote.urls.includes('https://api.github.com/repos/example/gpu/commits/main'))
  assert(remote.urls.some(url => url.includes(`raw.githubusercontent.com/example/gpu/${commit}/`)))
  assert(!remote.urls.some(url => url.includes('raw.githubusercontent.com/example/gpu/main/')))
  const snapshot = await loadReportSnapshot('gpu-study', 'graph-errors', root)
  assert.equal(snapshot.html, html)
  assert.equal(snapshot.record.updatedAt, '2026-10-19')
  assert.equal(snapshot.record.commit, commit)
})

test('an explicit source revision overrides the manifest branch', async t => {
  const root = await workspace(t)
  const remote = source()
  await synchronizeProjectReports('gpu-study', { root, ref: 'release/v1', fetcher: remote.fetcher })
  assert(remote.urls[0].endsWith('/commits/release%2Fv1'))
})

test('report dates use the file commit in UTC rather than import time', async t => {
  const root = await workspace(t)
  await synchronizeProjectReports('gpu-study', { root, fetcher: source({ date: '2026-10-19T23:30:00-02:00' }).fetcher })
  assert.equal((await loadReportSnapshot('gpu-study', 'graph-errors', root)).record.updatedAt, '2026-10-20')
})

test('imported binary assets and CSS dependencies retain their relative layout', async t => {
  const data = manifest()
  data.studies[1].report.assets = ['css/report.css', 'images/plot.png']
  const root = await workspace(t, data)
  const binary = Buffer.from([0, 255, 12, 128])
  const document = html.replace('</head>', '<link rel="stylesheet" href="css/report.css"></head>')
  await synchronizeProjectReports('gpu-study', { root, fetcher: source({ document, files: {
    'css/report.css': '.plot { background: url(../images/plot.png) }', 'images/plot.png': binary
  } }).fetcher })
  assert.deepEqual(await readFile(assetPath(root, 'gpu-study', 'graph-errors', 'images/plot.png')), binary)
  assert.equal((await loadReportSnapshot('gpu-study', 'graph-errors', root)).html, document)
})

test('unselected local assets fail before a snapshot is written', async t => {
  const root = await workspace(t)
  const document = html.replace('</body>', '<img src="missing.svg"></body>')
  await assert.rejects(synchronizeProjectReports('gpu-study', { root, fetcher: source({ document }).fetcher }), /not selected/)
  await assert.rejects(access(snapshotPath(root, 'gpu-study', 'graph-errors')))
  validateReportAssets(html, [])
})

test('a failed download leaves the existing snapshot and lockfile intact', async t => {
  const root = await workspace(t)
  await synchronizeProjectReports('gpu-study', { root, fetcher: source().fetcher })
  const lockPath = path.join(root, 'src/data/project-reports.lock.json')
  const before = await readFile(lockPath, 'utf8')
  await assert.rejects(synchronizeProjectReports('gpu-study', { root, fetcher: source({ fail: '/explainer.html' }).fetcher }), /download/)
  assert.equal(await readFile(lockPath, 'utf8'), before)
  assert.equal((await loadReportSnapshot('gpu-study', 'graph-errors', root)).html, html)
})

test('network failures identify the source request and leave the working tree untouched', async t => {
  const root = await workspace(t)
  await assert.rejects(synchronizeProjectReports('gpu-study', {
    root, fetcher: async () => { throw new Error('offline') }
  }), /Could not fetch https:\/\/api.github.com\/repos\/example\/gpu\/commits\/main: offline/)
  assert.deepEqual(await readReportLock(root), { version: 1, reports: {} })
  await assert.rejects(access(snapshotPath(root, 'gpu-study', 'graph-errors')))
})

test('all selected reports are downloaded before any snapshot is replaced', async t => {
  const root = await workspace(t)
  await synchronizeProjectReports('gpu-study', { root, fetcher: source().fetcher })
  const data = manifest()
  data.studies.push({ ...data.studies[1], slug: 'second-report', sourcePath: '03-second', report: { entry: '03-second/explainer.html', assets: [] } })
  await saveManifest(root, data)
  const before = await readFile(path.join(root, 'src/data/project-reports.lock.json'), 'utf8')
  await assert.rejects(synchronizeProjectReports('gpu-study', { root, fetcher: source({ document: html.replace('Replay results', 'Changed') }).fetcher }), /download/)
  assert.equal(await readFile(snapshotPath(root, 'gpu-study', 'graph-errors'), 'utf8'), html)
  assert.equal(await readFile(path.join(root, 'src/data/project-reports.lock.json'), 'utf8'), before)
})

test('repeat imports of the same revision produce no content or metadata changes', async t => {
  const root = await workspace(t)
  await synchronizeProjectReports('gpu-study', { root, fetcher: source().fetcher })
  const before = await readFile(path.join(root, 'src/data/project-reports.lock.json'), 'utf8')
  await synchronizeProjectReports('gpu-study', { root, fetcher: source().fetcher })
  assert.equal(await readFile(path.join(root, 'src/data/project-reports.lock.json'), 'utf8'), before)
})

test('snapshot integrity checks catch local edits, missing files and changed assets', async t => {
  const data = manifest()
  data.studies[1].report.assets = ['plot.png']
  const root = await workspace(t, data)
  const remote = source({ files: { 'plot.png': 'image bytes' } })
  await synchronizeProjectReports('gpu-study', { root, fetcher: remote.fetcher })
  await writeFile(assetPath(root, 'gpu-study', 'graph-errors', 'plot.png'), 'changed')
  await assert.rejects(loadReportSnapshot('gpu-study', 'graph-errors', root), /asset has changed/)
  await synchronizeProjectReports('gpu-study', { root, fetcher: remote.fetcher })
  await writeFile(snapshotPath(root, 'gpu-study', 'graph-errors'), html + 'changed')
  await assert.rejects(loadReportSnapshot('gpu-study', 'graph-errors', root), /outside the import procedure/)
  await rm(snapshotPath(root, 'gpu-study', 'graph-errors'))
  await assert.rejects(loadReportSnapshot('gpu-study', 'graph-errors', root), /snapshot is missing/)
})

test('removed assets are cleaned up without deleting locally edited files', async t => {
  const data = manifest()
  data.studies[1].report.assets = ['plot.png']
  const root = await workspace(t, data)
  await synchronizeProjectReports('gpu-study', { root, fetcher: source({ files: { 'plot.png': 'image bytes' } }).fetcher })
  await writeFile(assetPath(root, 'gpu-study', 'graph-errors', 'plot.png'), 'local edit')
  await saveManifest(root, manifest())
  await assert.rejects(synchronizeProjectReports('gpu-study', { root, fetcher: source().fetcher }), /edited locally/)
  assert.equal(await readFile(assetPath(root, 'gpu-study', 'graph-errors', 'plot.png'), 'utf8'), 'local edit')
  await writeFile(assetPath(root, 'gpu-study', 'graph-errors', 'plot.png'), 'image bytes')
  await synchronizeProjectReports('gpu-study', { root, fetcher: source().fetcher })
  await assert.rejects(access(assetPath(root, 'gpu-study', 'graph-errors', 'plot.png')))
})

test('missing imports have an actionable message and unknown projects are rejected', async t => {
  const root = await workspace(t)
  await assert.rejects(loadReportSnapshot('gpu-study', 'graph-errors', root), /pnpm projects:sync gpu-study/)
  await assert.rejects(synchronizeProjectReports('missing', { root }), /Unknown project/)
  assert.equal((await loadProjectManifests(root)).length, 1)
  assert.deepEqual(await readReportLock(root), { version: 1, reports: {} })
})

test('the full-page renderer preserves scripts, code, styles and anchors while adding navigation and metadata', () => {
  const result = renderProjectReport(html, {
    projectSlug: 'gpu-study', studySlug: 'graph-errors', projectTitle: 'GPU "Study"',
    description: 'Graphs & correctness', site: 'https://example.com',
    record: { repository: 'example/gpu', commit, sourcePath: '02-graphs/explainer.html', updatedAt: '2026-10-19' }
  })
  assert(result.includes('<body class="report">'))
  assert(result.includes('<script>window.reportReady = true</script>'))
  assert(result.includes('<style>body { color: red }</style>'))
  assert(result.includes('href="#results"'))
  assert(result.includes('href="/project/gpu-study/"'))
  assert(result.includes(`https://github.com/example/gpu/blob/${commit}/02-graphs/explainer.html`))
  assert(result.includes('href="https://example.com/project/gpu-study/graph-errors/"'))
  assert(result.includes('aria-label="Back to GPU &quot;Study&quot;"'))
  assert(result.includes('<meta property="og:title" content="Replay &amp; results">'))
  assert(!result.includes('Replay &amp;amp; results'))
  assert.equal((result.match(/<title>/g) ?? []).length, 1)
})

test('non-HTML downloads are refused', () => {
  assert.throws(() => renderProjectReport('Not an HTML document', {}), /complete HTML report/)
})
