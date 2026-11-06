# Pixel-terminal integration recovery

Two local Git references preserve the website before integration:

- `backup/original-2026-11-06`: the original website at `c69b715`, before the design prototypes.
- `backup/pre-integration-2026-11-06`: the committed design prototypes, with the original production homepage still in place.

Local offline backups live in `.backups/2026-11-06-pixel-terminal/` (ignored by Git):

- `original-site.tar.gz`: the tracked original website, without Git history or dependencies.
- `pre-integration-site.tar.gz`: the tracked checkpoint including the prototypes.
- `restore.bundle`: Git history and both backup references, usable without GitHub.
- `unpublished-draft.tar.gz`: a separate copy of the existing unpublished blog draft and image directory. It is not part of either commit.

## Preview the original without changing current work

From the repository root, create a separate checkout:

```sh
git worktree add ../astro-portfolio-original backup/original-2026-11-06
cd ../astro-portfolio-original
pnpm install --frozen-lockfile
pnpm dev --port 4323
```

Use `backup/pre-integration-2026-11-06` instead to recover the four prototypes as well.

## Restore using only the offline bundle

```sh
git clone .backups/2026-11-06-pixel-terminal/restore.bundle ../astro-portfolio-restored --branch backup/original-2026-11-06
```

These commands create separate directories and preserve any unfinished integration work.
To put a backup back on the current branch, first commit or stash current work, then
restore the tracked tree and review the resulting rollback before committing it:

```sh
git restore --source=backup/pre-integration-2026-11-06 --staged --worktree -- .
git diff --cached --stat
git commit -m "Restore website before pixel-terminal integration"
```

The backup refs and offline files are local. Publishing or pushing is a separate step.
