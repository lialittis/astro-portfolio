# Tianchi YU's Workshop

## A personal website made using `Astro`.


## Features

- Modern and Minimal bento-like, sleek UI Design
- All in one page (almost)
- Fully Responsive
- Performances and SEO optimizations
- Ready to be deployed on [Netlify](https://www.netlify.com/)
- Blog
- RSS support (your-domain/rss.xml)
- Cool 3d globe

## Tech Stack

- [Astro](https://astro.build)
- [unocss](https://unocss.dev/)
- [motion](https://motion.dev/)
- [d3](https://d3js.org/)
- [react]()

## Managing projects

Edit `src/lib/Projects.ts` in Helix to add or update a project. Each entry contains
`title`, `technologies`, `description`, and `url`; array order determines display
order. Set `status: 'preparing'` for a project that is not ready yet.

The optional `updatedAt: 'YYYY-MM-DD'` field supplies that project's displayed
last-modified date. Use the UTC date of the latest verified commit to the linked
repository, or to the specific project page for older portfolio links. Omit it
when the date is unknown; the page displays "Not recorded". These are stored
dates, so update the field when the project changes. Builds do not query GitHub
or Gitea for dates.

Preview changes with `pnpm dev` at `http://localhost:4321/project`, then run
`pnpm build` before committing and pushing.

### Selected studies and HTML reports

The GPU project has a local hub at `/project/ai-infra-gpu-study/`. Its CUDA graph
report is published at `/project/ai-infra-gpu-study/cuda-graph-errors/`, with its
original layout and scripts plus navigation back to the project and source.

Choose featured studies in
`src/data/project-studies/ai-infra-gpu-study.json`. Each study has a stable `slug`,
title, description, technology tags, and a repository `sourcePath`. Adding a
`report` with an HTML `entry` enables a local report page. Studies without a
report link to their experiment code and documentation on GitHub.

To update a report, edit and commit it in the project repository, then run:

```bash
pnpm projects:sync ai-infra-gpu-study

# Optional: import a specific branch, tag, or complete commit SHA.
pnpm projects:sync ai-infra-gpu-study --ref <revision>

pnpm build
pnpm preview
```

The command resolves the source revision once and imports every selected report
at that commit. It stores the unchanged HTML in `src/data/project-reports/` and
records the revision, source-file modification date, and file hashes in
`src/data/project-reports.lock.json`. Repeating the same import produces no
content changes. The report date comes from its source-file commit; the parent
project's `updatedAt` remains the explicitly maintained project date.

For a report with local images, stylesheets, or scripts, list their paths in
`report.assets`, relative to the HTML entry's directory. For example,
`["images/plot.svg", "styles.css"]`. Include dependencies referenced by those
stylesheets too. Assets are copied to
`public/project/<project-slug>/<study-slug>/`, preserving their relative paths.
External fonts and scripts retain their original URLs. Local report references
must use relative asset URLs or same-page `#anchors`.

Review the diff and both local pages before committing the snapshots, lockfile,
and any imported assets. Normal builds read these local copies and verify their
hashes; they do not download reports. Make report changes in the source project,
then sync again instead of editing the imported snapshot. Public GitHub imports
need no token; optionally set `GITHUB_TOKEN` locally to use authenticated API
rate limits. Tokens are not written to the imported files.

For another parent project, add a manifest in `src/data/project-studies/` and
connect its `slug`, `ref` (as `sourceRef`), and `studies` to the corresponding
entry in `src/lib/Projects.ts`. Existing projects without studies keep their
current links. Run `pnpm test:projects` when changing the import tools.

## Writing a blog post with Helix

Run these commands from the repository root after `pnpm install`:

```bash
# Terminal 1: live preview at http://localhost:4321/blog/
pnpm dev

# Terminal 2: create a draft and open it in Helix.
pnpm blog:new "Understanding LLVM Passes"
```

The generator creates `src/content/blog/understanding-llvm-passes.md` and
`public/blog/understanding-llvm-passes/`. It opens `hx` when run in an interactive
terminal. Use `--no-edit` to create files without opening the editor, or
`--slug my-stable-address` to choose the URL. Existing files are never overwritten.
The explicit `slug` stays fixed when you edit the title or rename the file.

Open Helix from the repository root (`hx` or `hx src/content/blog/my-post.md`) so
the project settings in `.helix/languages.toml` apply. Markdown visually wraps
at 88 columns and formats with the project's Prettier on save while preserving
paragraph line breaks. These settings override the legacy root formatter rules
that otherwise skip Markdown. No Markdown language server is required. If `hx`
or `pnpm` is missing from your shell's PATH, install or configure it locally.

New posts have this metadata (the generator fills in your title and slug):

```yaml
---
layout: ../../layouts/LayoutBlogPost.astro
title: Understanding LLVM Passes
slug: understanding-llvm-passes
description: ""
draft: true
tags: []
# Set pubDate: YYYY-MM-DD and draft: false when ready to publish.
---
```

Drafts appear in the local blog index with a Draft label and at their normal
`/blog/<slug>/` address. They can omit a publication date and have an empty
description while you write. Production builds exclude draft article pages,
index entries, and sitemap entries; RSS excludes drafts even in development.
Existing posts without `draft` remain published. Draft status does not make
files in a public Git repository or under `public/` private.

The layout already displays the article title, so begin the body with an
introduction and use `##` headings for sections. Store images in the generated
folder and give each image useful alt text:

```markdown
![Stages of the LLVM pass pipeline](/blog/understanding-llvm-passes/pass-pipeline.png)
```

For links to another post, use its deployed URL, such as
`[Another article](/blog/another-post/)`, rather than a relative `.md` file path.

When ready to publish:

1. Write a short `description`, set an unquoted `pubDate: YYYY-MM-DD` to the actual
   publication date, and change `draft: true` to `draft: false`.
2. Run `pnpm blog:check` to validate metadata, duplicate slugs, local images,
   internal page links, and links from published posts to drafts. It checks
   Markdown links (including reference links) and HTML `a`/`img` attributes;
   it does not fetch external URLs or validate heading fragments.
3. Run `pnpm build`, then `pnpm preview` to inspect the production site, including
   the article on a narrow screen. `pnpm preview` excludes drafts.
4. Review `git diff`, commit the article and its images, and push to `main`.
   The existing GitHub Pages workflow validates and builds before deployment.
   Pull requests also run the blog checks and a full build.

Publication dates control ordering; they do not schedule publication. You can
commit drafts as backups and publish later by changing their metadata.

Run `pnpm test:blog` when changing the authoring scripts or validation rules.

## Progress vault

The `/progress` dashboard loads only encrypted data. Its unencrypted YAML source
stays local and is ignored by Git.

```bash
# One-time setup: create data/progress.private.yml from the documented template.
pnpm progress:init

# After editing the private YAML, validate and encrypt it.
pnpm progress:validate
pnpm progress:encrypt
```

`progress:encrypt` asks twice for the complete, case-sensitive challenge response
and writes `public/data/progress.enc.json`. Commit that encrypted file when it is
ready to deploy. Enter it as `<answer>::<private-suffix>` and use at least 12 unpredictable
characters for the suffix; the public code puzzle alone is not resistant to offline guessing.

Task checkboxes persist in browser `localStorage`. When the optional Cloudflare Worker in
`progress-sync-worker/` is configured, checkbox state is encrypted in the browser and synchronized
across devices. The Worker receives opaque task identifiers and AES-GCM ciphertext only.

### Checkbox synchronization

The synchronization Worker requires a Workers KV binding named `PROGRESS_STATE` and a secret named
`SYNC_AUTH_HASH`. Create the namespace from `progress-sync-worker/` with:

```bash
pnpm install
pnpm wrangler login
pnpm wrangler kv namespace create PROGRESS_STATE
```

Add the returned namespace ID to `progress-sync-worker/wrangler.jsonc`, then run `pnpm secret:set`.
That command privately derives and uploads `SYNC_AUTH_HASH` from the complete challenge response.
Deploy with `pnpm deploy` and put the resulting public Worker URL in `src/config/progress-sync.ts`.
Never commit the complete response or authentication hash.

If the local YAML is lost, move any existing private file aside and run
`pnpm progress:decrypt` to restore it from the encrypted payload.

## Reference ❤️

- Gianmarco - https://github.com/Ladvace
