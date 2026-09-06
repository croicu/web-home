# Repo Setup

## Status: Implementation

## Problem statement

This repo was generated from a template (`croicu/tpl-ts`). It still contains placeholder
tokens that need to be replaced with real values before the repo is usable, and this file
itself needs to be retired once that's done.

## Placeholder tokens

| Token | Meaning | Appears in |
|---|---|---|
| `__project_name__` | Project / npm package name (kebab-case, e.g. `my-project`) | `package.json`'s `name`/`description` context, `index.html` title, `README.md`, `src/main.ts`, `.github/workflows/cd.yaml`'s archive naming |
| `__description__` | One-line description | `package.json`'s `description`, `README.md` tagline |
| `__mission__` | A paragraph describing what this repo builds and why | `CLAUDE.md`'s `## Mission` section |

**One exception**: `package.json`'s `name` field is written as `x__project_name__x` (padded
with a leading/trailing `x`), not the bare token -- npm package names can't start with an
underscore, and npm hard-errors on `package.json`'s `name` otherwise. Every other occurrence of
`__project_name__` stays unpadded. When replacing, strip the padding `x`s along with the token
in `package.json`, and make sure the value you substitute there is valid npm-name-shaped
(lowercase, no spaces -- kebab-case).

## Implementation plan

0. **If this folder is not already a git repo** (e.g. it was unzipped from the template rather
   than created via GitHub's "Use this template" button): ask the user for the SSH endpoint of
   the destination repo (their private git server, or `git@github.com:...` for GitHub). Also
   confirm whether the remote repo itself already exists there -- it may not. If it doesn't
   exist yet, ask the user how repos get provisioned rather than assuming; don't guess at
   server-specific tooling. Once the remote exists, `git init`, `git remote add origin
   <ssh-endpoint>`, and push once the placeholder replacement below is done and committed. Skip
   this step entirely if `.git/` already exists -- the GitHub-template path already has one.
1. Ask the user for the real values of `__project_name__`, `__description__`, and `__mission__`
   if they weren't already given.
2. Grep the whole repo case-sensitively for `__` to find every occurrence (this also catches
   any spot missed by the table above).
3. Replace each token with its real value. Also remove `README.md`'s `## Setup` section (the
   paragraph pointing at this file) -- it becomes stale once the tokens are gone.
4. Run `npm install`, then `npm run typecheck`, `npm run test:run`, and `npm run build` -- all
   should pass clean. Optionally sanity-run `npm run dev` to confirm the app actually boots in
   a browser.
5. Set the initial `Synced to` timestamp in `CLAUDE.md`'s `## Template Sync` section: fetch
   `tpl-ts`'s `ADDENDUM.md` (plain HTTPS, e.g. `WebFetch`) and use its latest entry's timestamp,
   or the current time if the addendum is empty -- otherwise a brand-new instance would look
   "behind" on history that predates it.
6. If the GitHub issue-based task workflow in `CLAUDE.md` will be used, create the
   `status:brainstorm` / `status:implementation` / `status:testing` / `status:ready-to-submit`
   labels on the new repo (`gh label create`) -- they don't exist on a fresh repo.
7. Delete this file (`tasks/repo_setup.md`) and its entry in `CLAUDE.md`'s `## Pending Tasks`
   section.

## Test results

<!-- Fill in after the first real instantiation. -->
