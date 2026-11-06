# Tianchi YU's Workshop

## A personal website made using `Astro`.


## Features

- Pixel observatory and terminal workspace design
- Shared light/dark theme across the homepage and core content pages
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

## Website design

The homepage at `/` combines the pixel observatory with the terminal workspace.
Blog, project, about, and publication pages share its colors and persistent
light/dark setting. The homepage retains research details, contact links,
security updates, life milestones, and the interactive travel globe. The intro
uses a compact Ph.D. student profile without promotional copy.

Edit homepage content in `src/lib/home.ts` and site navigation in
`src/lib/navigation.ts`. Production components live in `src/components/Pixel/`;
`src/layouts/PixelLayout.astro` and `src/style/pixel-site.css` provide the shared
shell and theme. Specialized tools and the standalone project HTML report keep
their own layouts.

The original site and the prototype checkpoint are preserved in local backup
branches and offline archives. See [design recovery](docs/design-recovery.md)
for exact restore commands.

### Shared page conventions

The homepage and core content pages share `Pixel/WindowHeader.astro` and the
`workspace` variant of `NavBar`. Window titles identify the current working directory; active navigation uses
the current URL. Display paths are maintained in `src/lib/terminal.ts`.
Use `PixelPage.astro` for content pages and `Pixel/PageHeading.astro` for their
heading, optional command, and description. Set `reading` on `PixelPage` for a
centered reading column.

Design tokens live in `src/style/pixel-site.css`:

| Element | Convention |
| --- | --- |
| Frame | 1180px maximum, 24px gutters / 12px on mobile |
| Background | Shared subtle 9px dot grid around desktop panels (1000px and wider); solid content panels and mobile backgrounds |
| Reading column | 48rem maximum, fluid on smaller screens |
| Page / section / card heading | 26–32px / 22px / 18px, shared sans-serif font |
| Body | 16px, 1.8 line height; monospace for commands and metadata |
| Action links and buttons | `.site-button`, 40px minimum height; `.site-button--small` for compact actions |
| Theme | Shared light/dark tokens; dark default, saved under `site-color-theme` |

Keep layout-specific cards, tables, and content in their page components.
News, conference tools, progress, and travel still use their earlier layouts;
the standalone HTML report preserves its imported presentation. Their migration
is a separate step. Design previews also retain their independent shell.

### Terminal directory model

The terminal is a presentation of the website, not an executable shell. Its path
logic follows a single Unix workspace. Web URLs remain unchanged (`/blog`,
`/project`, etc.); the displayed filesystem paths are a separate convention.

```text
/home/tianchi/                 = ~/
├── README.md                  homepage profile
├── contact.txt
├── life.log
├── writing/                   articles as <slug>.md
├── projects/
│   └── ai-infra-gpu-study/
│       ├── README.md
│       └── <study-slug>/
├── about/
│   ├── README.md
│   ├── education-experience.txt
│   ├── beyond-coding.txt
│   └── social/
├── research/                  Markdown records linking to the original papers
│   └── in_progress/status.txt
├── news/index.txt
└── conferences/
    ├── README.md
    └── active/                index.tsv and conference .yml records
/root/progress/                protected destination outside the user's home
```

- `~` always abbreviates `/home/tianchi`, never `/root` or `/home/tianchi-other`.
- Window titles give the working directory. Listing that directory uses `ls`;
  relative commands resolve from it. Each project detail has its own directory.
- Read a profile with `cat README.md`. `whoami` would only print the login name.
  Read project README files instead of `cat` on directories; publication records
  use `.md`, and their links open the original PDF. Quote dynamic file arguments.
- Navigation displays destinations (`~/`, `~/projects`, `/root/progress`), not
  invented `~/home` or `~/progress` directories. Action links are ordinary labels.
- Progress remains in the visitor's home session and depicts a privileged read
  with `sudo -u root -- ls /root/progress`. It does not claim an authenticated root
  shell, change directory, or display a root `#` prompt before verification.
  This is a visual convention only: access still uses the existing client-side
  encryption and verification, not OS permissions or a real `sudo` command.
- The directory listing UI omits fabricated file sizes, permissions and block
  totals. Recorded project update dates remain project metadata.

Historical `/design/` prototypes and unused demo pages retain their original
copy; they are not the current workspace model.

### Research content

Edit publications and the broad current directions in `src/lib/research.ts`.
The `/publications` page uses `~/research`, shows each paper once, and provides
an expandable abstract plus publisher/PDF links. Author order, year, and venue
should follow the publisher's record. The current-directions section ends with a
collaboration invitation linking to the homepage's click-to-reveal email display.
Keep this section to research themes that can be discussed publicly.

### Security news

Security digests remain in `src/content/updates/` with the `security` tag.
The latest page shows three entries; `/security-news/archive/` lists every digest
by year. Both use the shared `~/news` window and the same dated rows, with the first
source headline as a preview. Each entry
links to `/security-news/<slug>/`, where the original Markdown and source links
are rendered once in a normal reading column, with newer/older navigation.
These pages work without JavaScript; no card expansion or modal is needed.
The displayed commands read date-prefixed `.md` files from `~/news`; the archive
is a full listing of that same directory, not a separate filesystem folder.

### Conference deadlines

`/confclock` uses the shared `~/conferences` window. It reads CCF-A venues in
Systems, Security, and Software from `conferences/` via `src/lib/conferences.ts`.
Search, category, status, and sort controls apply to both the expandable list
and the table. Select a table entry to open its full submission schedule.
Dates retain their source timezone, including AoE (UTC−12). The client refreshes
countdowns and advances to the next submission round using the device clock;
closed rounds remain visible in each schedule. With JavaScript disabled, all
recorded conferences and native expandable schedules remain readable.
Run `node --experimental-strip-types --test tests/conference-time.test.mjs` for
UTC offsets and round-transition checks. `pnpm sync:conferences` remains the
existing way to refresh source data.

### Progress interface

`/progress` uses the shared pixel-terminal layout and theme. The visitor stays in
`~` and the displayed command requests `/root/progress`; unlocking does not
pretend to create a root shell. The board groups open tasks, project/activity
context (including completed checkboxes), and milestones. Completion changes
continue using the existing local persistence and encrypted sync service.
The form becomes interactive after hydration; loading, unlock errors, and
missing-data states are shown inline. Validate this interface with synthetic
encrypted fixtures and mocked sync responses, without touching private data.

### Workspace scene

The desk lamp uses the pixel pull cord in `ObservatoryScene.astro`, with pointer
and keyboard behavior in `src/scripts/workspace-scene.ts`. Click/tap the pull
handle, drag it down, or focus it and press Enter/Space to toggle. The initial
lamp follows the theme (dark: on, light: off); later theme changes update it after
two seconds. A manual toggle cancels that pending update, and repeated theme
changes restart the timer. Lamp state is not persisted. Reduced-motion settings
skip the automatic pull/rebound animation.

Mia and Kira are drawn in `src/components/Pixel/SceneCats.astro`: Mia rests by the
books with warm brown points; Kira sits on the sill with dark grey and white
fur and subtle tabby stripes. Their buttons support pointer, touch, Enter and
Space. Names appear on hover or keyboard focus, and brief responses settle back
to idle automatically. Idle motion pauses off-screen and respects reduced-motion
settings. Fur highlights follow the lamp state, including its theme delay.

### Contact addresses

`src/components/EmailAddress.astro` displays addresses using `[at]` / `[dot]`
notation, with a button to reveal a mail link and copy the address. Without
JavaScript the readable notation remains available. Other page footers link to
`/#contact` instead of publishing duplicate mail links.

This is lightweight obfuscation, not access control: bots can decode it, and
previously published addresses or repository history remain public. A dedicated,
replaceable website email alias offers better control if spam becomes a problem.

## Homepage design previews

Run `pnpm dev` and open `http://localhost:4321/design/` to compare the homepage
prototypes: `/design/paper/`, `/design/journal/`, `/design/observatory/`, and
`/design/pixel-terminal/` (the pixel scene combined with a terminal workspace).
The comparison bar switches between directions; each page has a light/dark
toggle. Both pixel designs have an interactive desk lamp and a Munich clock.
The pixel terminal's tabs and directory follow the current reading section.

All four use the same published articles and selected projects from
`src/lib/home.ts`, re-exported by `src/lib/design-preview.ts`. Preview components
live in `src/components/design/` and reuse the pixel scene and content components
from `src/components/Pixel/`. Preview styling is isolated in
`src/style/design-preview.css`, with a separate theme preference from the live
site. The previews remain available for comparison, are marked `noindex`, and
are excluded from the sitemap. Their content links open the production pages.

## Managing projects

Edit `src/lib/Projects.ts` in Helix to add or update a project. Each entry contains
`title`, `technologies`, `description`, and `url`. The project page sorts entries
by directory name to match `ls -1F`, and shows each project once with its directory,
description, technologies, update date, and available links. Local study hubs and
external repositories or project websites have separate actions. Set `status: 'preparing'` for a project that is not ready yet.

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
