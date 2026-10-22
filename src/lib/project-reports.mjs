import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'astro/zod'
import MarkdownIt from 'markdown-it'

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const safePath = z.string().min(1).refine(value =>
  !value.includes('\\') && !/[\x00-\x1f]/.test(value) &&
  value.split('/').every(segment => segment && segment !== '.' && segment !== '..'),
  'Use a relative file path without empty, dot or parent segments.'
)

export const projectManifestSchema = z.object({
  slug: slugSchema,
  repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  ref: z.string().min(1),
  studies: z.array(z.object({
    slug: slugSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    technologies: z.array(z.string()),
    sourcePath: safePath,
    report: z.object({ entry: safePath, assets: z.array(safePath).default([]) }).optional()
  })).min(1)
}).superRefine((manifest, context) => {
  const seen = new Set()
  for (const study of manifest.studies) {
    if (seen.has(study.slug)) context.addIssue({ code: 'custom', message: `Duplicate study slug: ${study.slug}` })
    seen.add(study.slug)
    if (!study.report) continue
    if (!study.report.entry.startsWith(study.sourcePath + '/')) {
      context.addIssue({ code: 'custom', message: `Report entry must be inside ${study.sourcePath}/.` })
    }
    if (study.report.assets.includes('index.html') || new Set(study.report.assets).size !== study.report.assets.length) {
      context.addIssue({ code: 'custom', message: 'Report assets must be unique and cannot replace index.html.' })
    }
  }
})

export async function loadProjectManifests(root = projectRoot) {
  const directory = path.join(root, 'src/data/project-studies')
  let files
  try { files = await readdir(directory) } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
  return Promise.all(files.filter(file => file.endsWith('.json')).sort().map(async file => {
    const manifest = projectManifestSchema.parse(JSON.parse(await readFile(path.join(directory, file), 'utf8')))
    if (file !== `${manifest.slug}.json`) throw new Error(`Manifest filename must match its slug: ${file}`)
    return manifest
  }))
}

export function projectResourceRoutes(manifests) {
  return manifests.flatMap(manifest => [
    `/project/${manifest.slug}`,
    ...manifest.studies.filter(study => study.report).map(study => `/project/${manifest.slug}/${study.slug}`)
  ])
}

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

export function snapshotPath(root, projectSlug, studySlug) {
  slugSchema.parse(projectSlug)
  slugSchema.parse(studySlug)
  return path.join(root, 'src/data/project-reports', projectSlug, studySlug, 'index.html')
}

export function assetPath(root, projectSlug, studySlug, asset) {
  slugSchema.parse(projectSlug)
  slugSchema.parse(studySlug)
  safePath.parse(asset)
  return path.join(root, 'public/project', projectSlug, studySlug, asset)
}

export async function readReportLock(root = projectRoot) {
  try {
    const lock = JSON.parse(await readFile(path.join(root, 'src/data/project-reports.lock.json'), 'utf8'))
    if (lock.version !== 1 || !lock.reports || typeof lock.reports !== 'object') throw new Error('Invalid project report lockfile.')
    return lock
  } catch (error) {
    if (error.code === 'ENOENT') return { version: 1, reports: {} }
    throw error
  }
}

export async function loadReportSnapshot(projectSlug, studySlug, root = projectRoot) {
  const manifest = (await loadProjectManifests(root)).find(item => item.slug === projectSlug)
  const study = manifest?.studies.find(item => item.slug === studySlug && item.report)
  if (!study) throw new Error(`Unknown report: ${projectSlug}/${studySlug}`)
  const record = (await readReportLock(root)).reports[`${projectSlug}/${studySlug}`]
  const remedy = `Run pnpm projects:sync ${projectSlug}.`
  if (!record || record.repository !== manifest.repository || record.sourcePath !== study.report.entry ||
      !/^[a-f0-9]{40}$/.test(record.commit) || !/^\d{4}-\d{2}-\d{2}$/.test(record.updatedAt)) {
    throw new Error(`Report source metadata is missing or inconsistent. ${remedy}`)
  }
  let content
  try { content = await readFile(snapshotPath(root, projectSlug, studySlug)) } catch (error) {
    if (error.code !== 'ENOENT') throw error
    throw new Error(`Report snapshot is missing. ${remedy}`)
  }
  if (sha256(content) !== record.sha256) throw new Error(`Report snapshot has changed outside the import procedure. ${remedy}`)
  for (const asset of study.report.assets) {
    let bytes
    try { bytes = await readFile(assetPath(root, projectSlug, studySlug, asset)) } catch (error) {
      if (error.code !== 'ENOENT') throw error
      throw new Error(`Report asset is missing: ${asset}. ${remedy}`)
    }
    if (sha256(bytes) !== record.assets?.[asset]) throw new Error(`Report asset has changed: ${asset}. ${remedy}`)
  }
  if (Object.keys(record.assets ?? {}).sort().join('\n') !== [...study.report.assets].sort().join('\n')) {
    throw new Error(`Report assets have not been synchronized. ${remedy}`)
  }
  return { html: content.toString('utf8'), record }
}

const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]))
const decodeEntities = new MarkdownIt().utils.unescapeAll

export function renderProjectReport(html, { projectSlug, studySlug, projectTitle, description, record, site }) {
  if (!/<head\b/i.test(html) || !/<\/head>/i.test(html) || !/<body\b[^>]*>/i.test(html)) {
    throw new Error('Expected a complete HTML report with a head and body.')
  }
  const parent = `/project/${projectSlug}/`
  const canonical = new URL(`${parent}${studySlug}/`, site).href
  const source = `https://github.com/${record.repository}/blob/${record.commit}/${record.sourcePath}`
  const commitUrl = `https://github.com/${record.repository}/commit/${record.commit}`
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1] : escape(projectTitle)
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\b(?=[^>]*(?:name\s*=\s*["']description["']|property\s*=\s*["']og:[^"']+["']))[^>]*>/gi, '')
    .replace(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi, '')
  const head = `
<title>${title} | Tianchi YU</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${escape(canonical)}">
<meta property="og:title" content="${escape(decodeEntities(title.replace(/<[^>]+>/g, '')))}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${escape(canonical)}">
<style>
/* Long inline identifiers can wrap; preformatted code retains its own scrolling. */
body { overflow-wrap: anywhere; }
.portfolio-report-nav { border-bottom: 1px solid var(--rule, #29343e); background: var(--surface, #151d24); font-family: var(--font-body, system-ui); font-size: .8125rem; }
.portfolio-report-nav-inner { box-sizing: border-box; max-width: 1240px; margin: 0 auto; padding: 12px 16px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 24px; }
.portfolio-report-links { display: flex; flex-wrap: wrap; gap: 12px 24px; }
.portfolio-report-nav a { color: var(--accent, #7aa4e8); text-decoration: none; }
.portfolio-report-nav a:hover { text-decoration: underline; }
.portfolio-report-nav a:focus-visible { outline: 2px solid var(--accent, #7aa4e8); outline-offset: 4px; }
.portfolio-report-version { display: flex; flex-wrap: wrap; gap: 6px 16px; color: var(--ink-2, #9aa9b5); }
</style>
`
  const navigation = `
<nav class="portfolio-report-nav" aria-label="Project navigation">
  <div class="portfolio-report-nav-inner">
    <div class="portfolio-report-links">
      <a href="${escape(parent)}" aria-label="Back to ${escape(projectTitle)}">← Back to project</a>
      <a href="${escape(source)}">View source ↗</a>
    </div>
    <div class="portfolio-report-version">
      <span>Updated <time datetime="${escape(record.updatedAt)}">${escape(record.updatedAt)}</time></span>
      <a href="${escape(commitUrl)}" title="Source commit ${escape(record.commit)}">Version ${escape(record.commit.slice(0, 7))}</a>
    </div>
  </div>
</nav>
`
  return html.replace(/<\/head>/i, head + '</head>').replace(/<body\b[^>]*>/i, body => body + navigation)
}
