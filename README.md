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

Hosted on Cloudflare Pages, deployed by `.github/workflows/cd.yaml`'s `deploy` job on every push
of a `v*` tag: builds `dist/` and runs `wrangler pages deploy dist --project-name=web-home`,
authenticated via the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` repo secrets (same model as
`geo-browser`). Push a tag to deploy:

```bash
git tag v0.1.0
git push origin v0.1.0
```
