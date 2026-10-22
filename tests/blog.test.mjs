import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import YAML from 'yaml'
import { checkPosts, createPost, loadPosts } from '../scripts/blog.mjs'
import { blogSchema, isBlogVisible } from '../src/lib/blog-schema.mjs'

async function workspace(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

async function file(root, name, contents = '') {
  const target = path.join(root, name)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, contents)
}

async function post(root, name, { body = '', ...metadata } = {}) {
  await file(root, `src/content/blog/${name}.md`, `---\n${YAML.stringify({
    layout: '../../layouts/LayoutBlogPost.astro',
    title: name,
    description: 'A short description.',
    pubDate: new Date('2026-10-22T00:00:00Z'),
    ...metadata
  })}---\n${body}`)
}

test('published posts require a description and publication date; drafts can omit the date', () => {
  const draft = { title: 'Work in progress', description: '', draft: true }
  assert(blogSchema.safeParse(draft).success)
  const published = blogSchema.safeParse({ ...draft, draft: false })
  assert(!published.success)
  assert.deepEqual(published.error.issues.map(issue => issue.path[0]), ['description', 'pubDate'])
  assert(!blogSchema.safeParse({ ...draft, pubDate: new Date('invalid') }).success)
  assert(!blogSchema.safeParse({ ...draft, draft: 'true' }).success)
})

test('drafts are excluded by default and included only when explicitly enabled', () => {
  assert.equal(isBlogVisible({ draft: true }), false)
  assert.equal(isBlogVisible({ draft: true }, true), true)
  assert.equal(isBlogVisible({}), true)
})

test('generator creates an undated draft with a stable slug, escaped title and image directory', async t => {
  const root = await workspace(t)
  const created = await createPost('LLVM: "Passes" & Plugins!', { root })
  assert.equal(created.slug, 'llvm-passes-plugins')
  const { posts, errors } = await loadPosts(root)
  assert.deepEqual(errors, [])
  assert.equal(posts[0].data.title, 'LLVM: "Passes" & Plugins!')
  assert.equal(posts[0].data.draft, true)
  assert.equal(posts[0].data.pubDate, undefined)
  assert.equal(await readFile(path.join(created.assets, '.gitkeep'), 'utf8'), '')
  assert.deepEqual((await checkPosts(root)).errors, [])
})

test('generator never overwrites an existing post or duplicates a legacy slug', async t => {
  const root = await workspace(t)
  await post(root, '2023-08-02-What is Three Address Code')
  await assert.rejects(createPost('Another title', { root, slug: '2023-08-02-what-is-three-address-code' }), /already in use/)
  const created = await createPost('My post', { root, slug: 'stable-address' })
  const before = await readFile(created.file, 'utf8')
  await assert.rejects(createPost('Changed title', { root, slug: 'stable-address' }), /already in use/)
  assert.equal(await readFile(created.file, 'utf8'), before)
})

test('generator rejects empty titles, reserved routes and unsafe slugs', async t => {
  const root = await workspace(t)
  await assert.rejects(createPost('   ', { root }), /title/)
  for (const slug of ['index', '../escape', '/absolute', 'two words', 'bad--slug', 'a'.repeat(101)]) {
    await assert.rejects(createPost('Title', { root, slug }), /--slug/)
  }
})

test('checker detects duplicate explicit and filename-derived slugs', async t => {
  const root = await workspace(t)
  await post(root, 'Legacy Title')
  await post(root, 'other', { slug: 'legacy-title' })
  assert.match((await checkPosts(root)).errors.join('\n'), /duplicate slug "legacy-title"/)
})

test('checker reports malformed YAML, invalid metadata, unsafe slugs and incorrect layouts together', async t => {
  const root = await workspace(t)
  await file(root, 'src/content/blog/bad-yaml.md', '---\ntitle: [\n---\n')
  await post(root, 'bad-date', { pubDate: 'not-a-date' })
  await post(root, 'bad-layout', { layout: '../../layouts/Other.astro' })
  await post(root, 'bad-slug', { slug: '../escape' })
  const result = await checkPosts(root)
  assert.equal(result.errors.length, 4)
  for (const name of ['bad-yaml', 'bad-date', 'bad-layout', 'bad-slug']) assert(result.errors.some(error => error.includes(name)))
})

test('checker supports root-relative and source-relative images and reports missing reference images', async t => {
  const root = await workspace(t)
  await file(root, 'public/blog/example/diagram.png')
  await file(root, 'public/assets/old.png')
  await post(root, 'example', { body: [
    '![Diagram](/blog/example/diagram.png)',
    '![Legacy](../../../public/assets/old.png)',
    '![Missing][diagram]',
    '',
    '[diagram]: /blog/example/missing.png'
  ].join('\n') })
  const { errors } = await checkPosts(root)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /missing local image.*missing.png/)
})

test('checker validates internal routes and encoded blog links, but skips external URLs and code examples', async t => {
  const root = await workspace(t)
  await file(root, 'src/pages/project.astro')
  await file(root, 'src/pages/security-news/archive.astro')
  await file(root, 'public/download.pdf')
  await post(root, '中文')
  await post(root, 'links', { body: [
    '[Projects](/project#section)',
    '[Archive](/security-news/archive/)',
    '[Chinese](/blog/%E4%B8%AD%E6%96%87/)',
    '[Download](/download.pdf)',
    '[External](https://example.com/anything)',
    '[Email](mailto:someone@example.com)',
    '```markdown',
    '![Example](/does-not-exist.png)',
    '<img src="/not-real.png">',
    '[Example](/not-real)',
    '```'
  ].join('\n') })
  assert.deepEqual((await checkPosts(root)).errors, [])
})

test('checker rejects broken internal links and published links to drafts, including absolute site links', async t => {
  const root = await workspace(t)
  await post(root, 'unfinished', { draft: true })
  await post(root, 'published', { body: '[Draft](https://tianchiyu.me/blog/unfinished/)\n[Broken](/missing/)' })
  const { errors } = await checkPosts(root)
  assert.equal(errors.length, 2)
  assert(errors.some(error => error.includes('links to draft')))
  assert(errors.some(error => error.includes('broken internal link')))
})

test('drafts may link to other drafts', async t => {
  const root = await workspace(t)
  await post(root, 'unfinished', { draft: true })
  await post(root, 'another', { draft: true, body: '[Draft](/blog/unfinished/)' })
  assert.deepEqual((await checkPosts(root)).errors, [])
})

test('blog posts can link to selected project pages and their published reports', async t => {
  const root = await workspace(t)
  await file(root, 'src/data/project-studies/gpu-study.json', JSON.stringify({
    slug: 'gpu-study', repository: 'example/gpu', ref: 'main', studies: [{
      slug: 'graph-errors', title: 'Graph errors', description: 'A visual report.',
      technologies: ['CUDA'], sourcePath: '02-graphs', report: { entry: '02-graphs/explainer.html', assets: [] }
    }]
  }))
  await post(root, 'project-links', { body: '[Project](/project/gpu-study/)\n[Report](/project/gpu-study/graph-errors/)' })
  assert.deepEqual((await checkPosts(root)).errors, [])
})

test('checker detects local references inside HTML without inspecting fenced HTML examples', async t => {
  const root = await workspace(t)
  await post(root, 'html', { body: '<img src="/missing.png">\n\n<a href="/missing/">Missing</a>' })
  const { errors } = await checkPosts(root)
  assert.equal(errors.length, 2)
  assert(errors.some(error => error.includes('missing local image')))
  assert(errors.some(error => error.includes('broken internal link')))
})
