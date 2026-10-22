import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import {
  assetPath, loadProjectManifests, projectRoot, readReportLock,
  renderProjectReport, sha256, slugSchema, snapshotPath
} from '../src/lib/project-reports.mjs'

const encodePath = value => value.split('/').map(encodeURIComponent).join('/')

function localReference(value) {
  if (!value || value.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return null
  if (value.startsWith('/')) throw new Error(`Report assets must use relative URLs: ${value}`)
  return decodeURIComponent(value.split(/[?#]/)[0])
}

export function validateReportAssets(html, assets) {
  const references = []
  for (const match of html.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) references.push(match[1])
  for (const match of html.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/gi)) references.push(match[1])
  for (const reference of references) {
    const local = localReference(reference)
    if (local && !assets.includes(path.posix.normalize(local))) {
      throw new Error(`Local report asset "${reference}" is not selected. Add it to report.assets in the project manifest.`)
    }
  }
}

export async function synchronizeProjectReports(slug, { root = projectRoot, ref, fetcher = fetch } = {}) {
  slugSchema.parse(slug)
  const manifest = (await loadProjectManifests(root)).find(item => item.slug === slug)
  if (!manifest) throw new Error(`Unknown project "${slug}". Add a manifest in src/data/project-studies/.`)
  const studies = manifest.studies.filter(study => study.report)
  if (!studies.length) throw new Error(`No HTML reports selected for ${slug}.`)
  const api = `https://api.github.com/repos/${manifest.repository}`
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'astro-portfolio-project-reports' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  async function request(url, options) {
    try { return await fetcher(url, options) } catch (error) {
      throw new Error(`Could not fetch ${url}: ${error.cause?.message ?? error.message}`)
    }
  }
  async function getJson(url) {
    const response = await request(url, { headers, signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw new Error(`GitHub request failed (${response.status}): ${url}`)
    return response.json()
  }
  async function download(sourcePath, commit) {
    const url = `https://raw.githubusercontent.com/${manifest.repository}/${commit}/${encodePath(sourcePath)}`
    const response = await request(url, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw new Error(`Could not download report file (${response.status}): ${sourcePath}`)
    return Buffer.from(await response.arrayBuffer())
  }
  const revision = await getJson(`${api}/commits/${encodeURIComponent(ref ?? manifest.ref)}`)
  if (!/^[a-f0-9]{40}$/.test(revision.sha)) throw new Error('GitHub did not return a complete source commit SHA.')
  const lock = await readReportLock(root)
  const staged = []
  // Download and validate everything before changing any published snapshot.
  for (const study of studies) {
    const { entry, assets } = study.report
    const html = await download(entry, revision.sha)
    const sourceDirectory = path.posix.dirname(entry)
    const files = []
    for (const relative of assets) {
      const bytes = await download(`${sourceDirectory}/${relative}`, revision.sha)
      files.push({ relative, bytes })
    }
    validateReportAssets(html.toString('utf8'), assets)
    for (const file of files.filter(file => file.relative.endsWith('.css'))) {
      for (const match of file.bytes.toString('utf8').matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/gi)) {
        const local = localReference(match[1])
        if (local && !assets.includes(path.posix.normalize(path.posix.join(path.posix.dirname(file.relative), local)))) {
          throw new Error(`CSS asset dependency is not selected: ${file.relative} -> ${match[1]}`)
        }
      }
    }
    const history = await getJson(`${api}/commits?sha=${revision.sha}&path=${encodeURIComponent(entry)}&per_page=1`)
    const date = new Date(history[0]?.commit?.committer?.date)
    if (Number.isNaN(date.getTime())) throw new Error(`Could not determine the source modification date for ${entry}.`)
    const record = {
      repository: manifest.repository,
      commit: revision.sha,
      sourcePath: entry,
      updatedAt: date.toISOString().slice(0, 10),
      sha256: sha256(html),
      assets: Object.fromEntries(files.map(file => [file.relative, sha256(file.bytes)]))
    }
    renderProjectReport(html.toString('utf8'), {
      projectSlug: slug, studySlug: study.slug, projectTitle: slug,
      description: study.description, record, site: 'https://tianchiyu.me'
    })
    const staleAssets = []
    for (const [relative, hash] of Object.entries(lock.reports[`${slug}/${study.slug}`]?.assets ?? {})) {
      if (assets.includes(relative)) continue
      const target = assetPath(root, slug, study.slug, relative)
      try {
        if (sha256(await readFile(target)) !== hash) throw new Error(`Old imported asset was edited locally: ${target}. Review it before syncing.`)
        staleAssets.push(target)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }
    staged.push({ study, html, files, record, staleAssets })
  }
  for (const { study, html, files, record, staleAssets } of staged) {
    const target = snapshotPath(root, slug, study.slug)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, html)
    for (const file of files) {
      const targetAsset = assetPath(root, slug, study.slug, file.relative)
      await mkdir(path.dirname(targetAsset), { recursive: true })
      await writeFile(targetAsset, file.bytes)
    }
    for (const oldAsset of staleAssets) await unlink(oldAsset)
    lock.reports[`${slug}/${study.slug}`] = record
  }
  await mkdir(path.join(root, 'src/data'), { recursive: true })
  lock.reports = Object.fromEntries(Object.entries(lock.reports).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(path.join(root, 'src/data/project-reports.lock.json'), JSON.stringify(lock, null, 2) + '\n')
  return { commit: revision.sha, reports: staged.length }
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { ref: { type: 'string' }, help: { type: 'boolean', short: 'h' } }
  })
  if (values.help || !positionals.length) {
    console.log('Usage: pnpm projects:sync <project-slug> [--ref branch-tag-or-commit]\n\nImports selected HTML reports and declared assets at one source commit.\nReview the resulting diff and preview before publishing. Normal builds use local snapshots.')
    return
  }
  if (positionals.length !== 1) throw new Error('Provide exactly one project slug.')
  const result = await synchronizeProjectReports(positionals[0], { ref: values.ref })
  console.log(`Imported ${result.reports} report(s) for ${positionals[0]} at ${result.commit}.\nReview git diff, then run pnpm build and pnpm preview.`)
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
