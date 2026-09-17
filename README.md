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

If the local YAML is lost, move any existing private file aside and run
`pnpm progress:decrypt` to restore it from the encrypted payload.

## Reference ❤️

- Gianmarco - https://github.com/Ladvace
