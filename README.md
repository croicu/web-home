# web-home

Landing page for croicu.com

---

## Install

```bash
npm install
```

## Develop

```bash
npm run dev       # Vite dev server
```

## Typecheck

```bash
npm run typecheck
```

## Test

```bash
npm test          # Vitest watch mode
npm run test:run  # Vitest single run (CI)
```

## Build

```bash
npm run build      # tsc + vite build -> dist/
npm run preview    # preview dist/ locally
```

## Deploy

Hosted on Cloudflare Workers (static assets), connected via Git integration in the Cloudflare
dashboard: every push/merge to `main` builds (`npm run build`) and deploys (`npx wrangler deploy`)
automatically, serving `dist/` per `wrangler.jsonc`'s `assets.directory`. No manual deploy step is
needed for normal changes.

To deploy manually from a local checkout:

```bash
npm run build
npx wrangler deploy
```
