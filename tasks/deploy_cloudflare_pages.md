# Deploy: Cloudflare Pages

## Status: Done

## Problem statement

An instance repo builds a static `dist/` via `npm run build` but has no hosting story of its own.
This task wires up Cloudflare Pages deployment, matching the model already used on `geo-browser`
(and applied to `web-home` when this task was written): a tag-triggered GitHub Actions job runs
`wrangler pages deploy`, authenticated via repo secrets, rather than Cloudflare's own dashboard
Git integration.

This is **optional and independent of `tasks/repo_setup.md`** -- it is not part of the mandatory
instantiation flow. Run it only when the repo owner explicitly asks to deploy the instance
somewhere, and Cloudflare Pages is the chosen target (not every instance will want this host).

Attaching a real domain (the "apex domain" case) is a further, separately-optional step within
this task -- plenty of instances will only ever need the `*.pages.dev` URL Cloudflare gives every
project for free.

## Implementation plan

1. **Create a Cloudflare API token.** In the Cloudflare dashboard: account icon (top right) ->
   **My Profile** -> **API Tokens** -- *not* "Manage account -> Account API Tokens", which is a
   separate, account-owned bucket that's typically empty; the tokens actually used for deploys
   turned out to be user-scoped ones under My Profile. Create a **Custom token**:
   - Name it after the instance (e.g. the project name), so multiple instances' tokens stay
     identifiable in the list.
   - Permissions: `Account | Cloudflare Pages | Edit` and `Account | Account Settings | Read`.
   - Account Resources: `Include` -> the one specific Cloudflare account (not "All accounts" --
     tighter scoping is possible here even though Cloudflare has no way to scope a token to a
     single Pages *project*).
   - No Zone Resources needed.
   - Copy the value immediately -- Cloudflare only shows it once.
2. **Find the Cloudflare Account ID.** Dashboard's Account Home / Overview page, right sidebar --
   or run `npx wrangler login` followed by `npx wrangler whoami`.
3. **Add two GitHub repo secrets** (Settings -> Secrets and variables -> Actions -> New repository
   secret): `CLOUDFLARE_API_TOKEN` (step 1's value) and `CLOUDFLARE_ACCOUNT_ID` (step 2's value).
4. **Add a `deploy` job to `.github/workflows/cd.yaml`**, alongside (not replacing) the existing
   `release` job -- both triggered by the same `push: tags: [v*]`:
   ```yaml
   deploy:
     name: Build and deploy to Cloudflare Pages
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-node@v4
         with:
           node-version: 22
           cache: npm
       - run: npm ci
       - run: npm run test:run
       - run: npm run build
       - uses: cloudflare/wrangler-action@v3
         with:
           apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
           accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
           command: pages deploy dist --project-name=<project-name> --branch=main --commit-dirty=true
   ```
   Replace `<project-name>` with the instance's actual project name (the same value substituted
   for `__project_name__` during `repo_setup.md`).
5. **Bootstrap the Pages project once, before the first deploy.** `wrangler pages deploy` does
   *not* auto-create a missing project -- it fails with `Project not found ... [code: 8000007]` if
   the project doesn't already exist. Cloudflare's dashboard "Create application" wizard also no
   longer offers a plain Pages-only creation path as of the current dashboard revision (it defaults
   new projects into a unified Workers-with-assets flow instead, which is a different product --
   `wrangler deploy` against a `wrangler.jsonc`'s `assets.directory`, not `wrangler pages deploy`).
   So create the Pages project via the CLI instead, once, locally:
   ```bash
   npx wrangler login
   npx wrangler pages project create <project-name> --production-branch=main
   ```
   `wrangler login` opens a browser to authenticate with your own Cloudflare account (separate from
   the CI token from step 1) -- this is a one-time local bootstrap step, not something CI does.
6. **Push a version tag to trigger the first real deploy**: `git tag v0.1.0 && git push origin
   v0.1.0`. Confirm the `deploy` job succeeds and the site is reachable at the
   `https://<project-name>-<hash>.pages.dev` URL Cloudflare reports.
7. **Optional -- attach a real domain.** Only relevant if the instance is meant to serve a domain
   the owner controls (not every instance will be). Requires that domain's zone to already be
   active in the same Cloudflare account (check under **Domains**/**Websites** in the dashboard).
   Then: Workers & Pages -> `<project-name>` -> **Custom domains** tab -> add the domain. If the
   zone is in the same account, Cloudflare auto-creates the required DNS record (a CNAME at the
   apex, or a subdomain) and provisions SSL automatically -- no manual DNS editing needed.

## Test results

Applied to `croicu/web-home` on 2026-09-06:
- Token created under My Profile -> API Tokens named `web-home`, permissions `Cloudflare Pages:
  Edit` + `Account Settings: Read`, scoped to the one account -- matching the pre-existing
  `geo-places` token's pattern (a second `geo-browser` token found during setup was much broader,
  looked like a leftover `wrangler login` OAuth token, and was not used as the model).
- First deploy attempt failed exactly as step 5 warns: `Project not found ... [code: 8000007]`.
  Ran `npx wrangler login` + `npx wrangler pages project create web-home --production-branch=main`
  locally, then re-ran the failed GitHub Actions job (`gh run rerun <id> --failed`) -- succeeded,
  site live at `https://web-home-87r.pages.dev/`.
- Step 7 (custom domain) completed: `croicu.com`'s zone was already active in the same account, so
  adding it under Custom domains auto-created the CNAME (`@` -> `web-home-87r.pages.dev`) and
  provisioned SSL with no manual DNS work. Confirmed live at `https://croicu.com`.
