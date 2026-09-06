# Secure Repo

## Status: Done

## Problem statement

A freshly instantiated repo's `main` branch has no protection: anyone with write access can push
directly to it, force-push, or delete it, and there's no required CI check before code lands.
This task locks `main` down using the same branch-protection model already used on `geo-browser`.

This is **optional and independent of `tasks/repo_setup.md`** -- it is not part of the mandatory
instantiation flow. Run it only when the repo owner explicitly asks to "lock down" or "secure" the
repo, whenever that happens to be (often well after instantiation, once the repo has real content
worth protecting).

## Prerequisite

Classic branch protection (the API this task uses) requires the repository to be public, or the
owner's GitHub account to have Pro/Team/Enterprise for a private repo. Check first:

```bash
gh repo view <owner>/<repo> --json isPrivate -q .isPrivate
```

If `true` and the account has no paid plan, the protection API call in step 4 will 403 -- tell the
user rather than silently failing partway through.

## Implementation plan

1. **Give the CI status check a stable, descriptive name.** In `.github/workflows/ci.yaml`, add an
   explicit `name:` to the job (not just the job id) -- this name becomes the GitHub Actions
   check-run name, and branch protection matches on that exact string, not the job id. Match the
   existing convention: `name: Typecheck, test, build`.
2. **Switch the push trigger off `main`.** Change:
   ```yaml
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]
   ```
   to:
   ```yaml
   on:
     push:
       branches-ignore: [main]
     pull_request:
       branches: [main]
   ```
   Once `main` is protected, direct pushes to it won't happen anyway -- this just makes CI run on
   every other branch's pushes (fast feedback before a PR even exists) instead of redundantly
   re-running on a push to `main` that a PR already checked.
3. **Commit and push this change directly to `main`.** This is the last direct push that will ever
   land, since protection isn't active yet.
4. **Apply branch protection**, matching `geo-browser`'s model exactly:
   ```bash
   cat > /tmp/protection.json <<'EOF'
   {
     "required_status_checks": {
       "strict": true,
       "contexts": ["Typecheck, test, build"]
     },
     "enforce_admins": true,
     "required_pull_request_reviews": {
       "dismiss_stale_reviews": false,
       "require_code_owner_reviews": false,
       "required_approving_review_count": 0
     },
     "restrictions": null,
     "required_linear_history": false,
     "allow_force_pushes": false,
     "allow_deletions": false,
     "block_creations": false,
     "required_conversation_resolution": false,
     "lock_branch": false,
     "allow_fork_syncing": false
   }
   EOF
   gh api --method PUT repos/<owner>/<repo>/branches/main/protection --input /tmp/protection.json
   ```
   `required_approving_review_count: 0` keeps this workable for a solo maintainer -- a PR is still
   required to merge, and `enforce_admins: true` means even the owner can't bypass it with a direct
   push, but no second reviewer is needed. Raise the count if/when the repo gets other
   contributors.
5. **Verify**: `gh api repos/<owner>/<repo>/branches/main/protection` and confirm the fields match
   step 4's payload. The status check's `checks[].app_id` may show `null` until the renamed CI job
   has actually run once under GitHub Actions -- expected, and it self-corrects on the next run.
6. **Tell the user this changes the day-to-day workflow.** Every change -- including the repo
   owner's own -- now needs a feature branch + PR to reach `main`; direct pushes and force-pushes
   are rejected. Offer to add a short note to the instance's own `CLAUDE.md` documenting this (see
   `web-home`'s `CLAUDE.md` for the pattern), since it changes how "Before committing" and the task
   workflow's git mechanics actually play out.

## Test results

Applied to `croicu/web-home` on 2026-09-06:
- `.github/workflows/ci.yaml` job renamed to `Typecheck, test, build`; trigger switched to
  `push: branches-ignore: [main]` + `pull_request: branches: [main]`.
- Branch protection applied via `gh api` exactly as in step 4; verified via
  `gh api repos/croicu/web-home/branches/main/protection` to match.
- This PR (the one adding this file) is the first real exercise of the resulting PR-required
  workflow.
