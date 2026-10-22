import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { slug as githubSlug } from 'github-slugger'
import MarkdownIt from 'markdown-it'
import YAML from 'yaml'
import { blogSchema } from '../src/lib/blog-schema.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const markdown = new MarkdownIt({ html: true })
const site = 'https://tianchiyu.me'

async function filesUnder(directory) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
  const files = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    // Match Astro's convention for ignored content and page files.
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await filesUnder(file))
    else if (entry.isFile()) files.push(file)
  }
  return files
}

async function isFile(file) {
  try {
    return (await stat(file)).isFile()
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false
    throw error
  }
}

function normalizeRoute(route) {
  return route.replace(/\/+$/, '') || '/'
}

export async function loadPosts(root = projectRoot) {
  const directory = path.join(root, 'src/content/blog')
  const posts = []
  const errors = []
  for (const file of (await filesUnder(directory)).filter(file => file.endsWith('.md'))) {
    const label = path.relative(root, file)
    try {
      const source = await readFile(file, 'utf8')
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      if (!match) throw new Error('Missing YAML frontmatter delimited by --- on separate lines.')
      const raw = YAML.parse(match[1], { customTags: ['timestamp'] })
      const result = blogSchema.safeParse(raw)
      if (!result.success) {
        throw new Error(result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; '))
      }
      const fallbackSlug = path.relative(directory, file).slice(0, -3)
        .split(path.sep).map(segment => githubSlug(segment)).join('/').replace(/\/index$/, '')
      const slug = raw.slug ?? fallbackSlug
      if (typeof slug !== 'string' || !/^[\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*$/u.test(slug) || slug === 'index') {
        throw new Error('slug must be a nonempty URL path using letters, numbers, hyphens or underscores; "index" is reserved.')
      }
      const expectedLayout = path.join(root, 'src/layouts/LayoutBlogPost.astro')
      if (typeof raw.layout !== 'string' || path.resolve(path.dirname(file), raw.layout) !== expectedLayout) {
        throw new Error('layout must point to src/layouts/LayoutBlogPost.astro.')
      }
      posts.push({ file, label, slug, data: result.data, body: source.slice(match[0].length) })
    } catch (error) {
      errors.push(`${label}: ${error.message}`)
    }
  }
  return { posts, errors }
}

function markdownReferences(body) {
  const references = []
  function visit(tokens) {
    for (const token of tokens) {
      if (token.type === 'image') references.push({ image: true, url: token.attrGet('src') })
      if (token.type === 'link_open') references.push({ image: false, url: token.attrGet('href') })
      if (token.type === 'html_inline' || token.type === 'html_block') {
        // Only inspect actual HTML tokens, never example HTML inside fenced code.
        for (const match of token.content.matchAll(/<(a|img)\b[^>]*>/gi)) {
          const image = match[1].toLowerCase() === 'img'
          const attribute = image ? 'src' : 'href'
          const value = match[0].match(new RegExp(`\\s${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
          if (value) references.push({ image, url: value[1] ?? value[2] ?? value[3] })
        }
      }
      if (token.children) visit(token.children)
    }
  }
  visit(markdown.parse(body, {}))
  return references
}

export async function checkPosts(root = projectRoot) {
  const { posts, errors } = await loadPosts(root)
  const bySlug = new Map()
  for (const post of posts) {
    if (bySlug.has(post.slug)) {
      errors.push(`${post.label}: duplicate slug "${post.slug}" (also used by ${bySlug.get(post.slug).label}).`)
    } else bySlug.set(post.slug, post)
  }
  const routes = new Set()
  for (const file of await filesUnder(path.join(root, 'src/pages'))) {
    const relative = path.relative(path.join(root, 'src/pages'), file).split(path.sep).join('/')
    if (relative.includes('[') || !/\.(astro|md|mdx|html|js|ts)$/.test(relative)) continue
    const route = '/' + relative.replace(/\.(astro|md|mdx|html|js|ts)$/, '').replace(/(^|\/)index$/, '')
    routes.add(normalizeRoute(route))
  }
  routes.add('/blog')
  for (const post of posts) {
    for (const reference of markdownReferences(post.body)) {
      const raw = reference.url?.trim()
      if (!raw || raw.startsWith('#')) continue
      try {
        const url = new URL(raw, `${site}/blog/${post.slug}/`)
        if (!['http:', 'https:'].includes(url.protocol) || url.host !== new URL(site).host) continue
        const pathname = decodeURIComponent(url.pathname)
        if (reference.image) {
          const sourceRelative = !raw.startsWith('/') && !/^[a-z][a-z\d+.-]*:/i.test(raw)
          const imagePath = sourceRelative
            ? path.resolve(path.dirname(post.file), decodeURIComponent(raw.split(/[?#]/)[0]))
            : path.join(root, 'public', pathname)
          if (!await isFile(imagePath)) errors.push(`${post.label}: missing local image "${raw}".`)
          continue
        }
        const route = normalizeRoute(pathname)
        if (route.startsWith('/blog/')) {
          const target = bySlug.get(route.slice('/blog/'.length))
          if (target) {
            if (!post.data.draft && target.data.draft) errors.push(`${post.label}: published post links to draft "${raw}".`)
            continue
          }
        }
        if (!routes.has(route) && !await isFile(path.join(root, 'public', pathname))) {
          errors.push(`${post.label}: broken internal link "${raw}". Use the deployed page URL, e.g. /blog/my-post/.`)
        }
      } catch (error) {
        errors.push(`${post.label}: cannot validate "${raw}": ${error.message}`)
      }
    }
  }
  return { posts, errors: [...new Set(errors)] }
}

export async function createPost(title, { root = projectRoot, slug } = {}) {
  title = title.trim()
  if (!title) throw new Error('Provide a post title.')
  slug ??= title.normalize('NFKD').replace(/\p{M}+/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
  if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug) || slug.length > 100 || slug === 'index') {
    throw new Error('Choose --slug using letters, numbers and single hyphens (max 100 characters); "index" is reserved.')
  }
  const { posts, errors } = await loadPosts(root)
  if (errors.length) throw new Error(`Fix existing frontmatter first:\n${errors.join('\n')}`)
  if (posts.some(post => post.slug === slug)) throw new Error(`The slug "${slug}" is already in use. Choose another --slug.`)
  const directory = path.join(root, 'src/content/blog')
  const file = path.join(directory, `${slug}.md`)
  const metadata = YAML.stringify({
    layout: '../../layouts/LayoutBlogPost.astro',
    title,
    slug,
    description: '',
    draft: true,
    tags: []
  })
  const body = [
    '<!-- The layout displays the title. Start with an introduction here. -->',
    '',
    '## The idea',
    '',
    '<!-- What problem are you solving, or what did you learn? -->',
    '',
    '## Example',
    '',
    '<!-- Add a concrete example, code, or a diagram. -->',
    '',
    '## What I learned',
    '',
    '## References',
    ''
  ].join('\n')
  await mkdir(directory, { recursive: true })
  await writeFile(file, `---\n${metadata}# Set pubDate: YYYY-MM-DD and draft: false when ready to publish.\n---\n\n${body}`, { flag: 'wx' })
  const assets = path.join(root, 'public/blog', slug)
  await mkdir(assets, { recursive: true })
  await writeFile(path.join(assets, '.gitkeep'), '', { flag: 'a' })
  return { file, slug, assets }
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { slug: { type: 'string' }, 'no-edit': { type: 'boolean' }, help: { type: 'boolean', short: 'h' } }
  })
  const [command, ...words] = positionals
  if (values.help || !command) {
    console.log('Usage:\n  pnpm blog:new "Post title" [--slug custom-slug] [--no-edit]\n  pnpm blog:check\n\nNew posts open in hx in an interactive terminal. Existing files are never overwritten.')
    return
  }
  if (command === 'new') {
    const post = await createPost(words.join(' '), { slug: values.slug })
    console.log(`Created ${path.relative(projectRoot, post.file)}\nImages: ${path.relative(projectRoot, post.assets)}\nLocal preview: /blog/${post.slug}/ (run pnpm dev)`)
    if (!values['no-edit'] && process.stdin.isTTY && process.stdout.isTTY) {
      const editor = spawnSync('hx', [post.file], { stdio: 'inherit' })
      if (editor.error || editor.status !== 0) console.error(`The draft was saved, but hx could not open it. Open it manually:\nhx ${JSON.stringify(post.file)}`)
    } else console.log(`Open in Helix: hx ${JSON.stringify(post.file)}`)
    return
  }
  if (command === 'check' && !words.length && !values.slug && !values['no-edit']) {
    const { posts, errors } = await checkPosts()
    if (errors.length) throw new Error(errors.join('\n'))
    const drafts = posts.filter(post => post.data.draft).length
    console.log(`Blog check passed: ${posts.length - drafts} published, ${drafts} draft(s). Metadata, slugs, local images and internal page links are valid.`)
    return
  }
  throw new Error('Unknown command or options. Run pnpm blog:new --help for usage.')
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
