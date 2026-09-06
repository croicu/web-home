# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mission

`web-home` is the static landing page served at the croicu.com domain. For now it's a single
static page: no client-side JavaScript, no outbound links — just a page of visual art. The
project scaffold (TypeScript build, logging/runtime plumbing, test suite) is kept in place from
the template for future growth, but nothing on the shipped page currently depends on it.

## Template Sync

- **Source**: [croicu/tpl-ts](https://github.com/croicu/tpl-ts)
- **Synced to**: 2026-09-06 (through the "Optional repo-security lockdown task" addendum entry --
  applied the same day it was written, since this repo was the one that prompted writing it)

This repo is either `tpl-ts` itself or was generated from it. `tpl-ts`'s `ADDENDUM.md` is a
curated, timestamped log of changes meant for downstream instances (new/changed rules,
base-module fixes, obsoleted patterns) — routine housekeeping doesn't get an entry. Which
protocol below applies depends on which repo you're in.

### Reading the addendum (applies in an instance)

1. Fetch `tpl-ts`'s `ADDENDUM.md` over plain HTTPS (e.g. `WebFetch` against the raw content
   URL) — no `gh` CLI, no `git clone`, no persistent git remote required.
2. Compare each row's timestamp against this repo's `Synced to` value above.
3. For rows newer than that, fetch only that entry's individual file under `addendum/` (not the
   whole history) and decide whether/how to apply it here.
4. After applying (or deliberately skipping) everything newer, bump `Synced to` above to the
   latest entry's timestamp.

### Writing an addendum entry (applies only in `tpl-ts` itself)

1. When making a change meant for downstream instances, add a new file under `addendum/`
   (filename prefixed with an ISO timestamp) describing what changed, why, and what an instance
   should do about it.
2. Append a row to `ADDENDUM.md`'s table (timestamp, title, filename).

## Repo Security

`main` is branch-protected (applied 2026-09-06, matching `geo-browser`'s model; see
[tasks/secure_repo.md](tasks/secure_repo.md) for the steps and the exact settings):

- A PR is required to merge into `main` -- direct pushes are rejected, **including for the repo
  owner** (`enforce_admins` is on).
- The `Typecheck, test, build` CI check must pass before merging (`.github/workflows/ci.yaml`).
- No force-pushes, no branch deletion.
- 0 approvals are required (solo maintainer) -- the PR gate itself, plus the CI check, is the
  protection; raise the approval count if the repo ever gets other contributors.

Practical effect on the workflow above and in "Before committing": every change, including a
one-line doc fix, now goes `git checkout -b <branch>` → commit → `git push -u origin <branch>` →
`gh pr create` → wait for the CI check → `gh pr merge` (or merge in the GitHub UI), rather than a
direct commit to `main`.

## Cross-Repo Coordination

Not every instance needs this section — add it (or an adapted version of it) once this repo has a
real data/API contract with another repo in your ecosystem (a producer/consumer relationship, not
just "both repos happen to exist"). Same judgment call as the multi-package case in Architecture
convention 7: build this when the need is real, don't pre-build it. Retrofit is cheap — this is
process guidance, not code.

**Placement rule**: a cross-repo issue lives in whichever repo owns the actionable follow-up, not
necessarily where the need originated:
- **This repo ships a breaking or notable change** (a changed contract, a deprecated symbol, a
  schema migration) → open an issue in the consumer repo(s) announcing it, since that's where the
  reacting work happens.
- **A consumer needs something from this repo** (a new capability, a bug in what it returns) →
  open an issue here requesting it, since that's where the building work happens.

**Does a given change need one at all?** If this repo curates a public surface (Architecture
convention 8), use that boundary to decide cheaply instead of re-deriving it each time: touched
only internal implementation (not re-exported, not a documented URL param/persisted file format)?
No cross-repo issue needed, *unless* the change alters externally observable behavior anyway (a
bug fix that changes what a public function returns still counts). Touched the actual public
surface (an `index.ts` re-export, a public class's constructor/method signature, a URL param, a
persisted file/wire-format schema)? Default to assuming a cross-repo issue is needed, then
confirm.

**Conventions**:
- Label every cross-repo issue `cross-repo` (alongside the normal `status:*` label) so these
  threads are filterable apart from this repo's own internal work — create the label
  (`gh label create`) if it doesn't exist yet.
- Always cross-link: the issue body must reference the originating repo/issue/commit, so either
  side is navigable from the other.
- Use `gh issue create --repo <owner>/<repo>` to open a cross-repo issue directly from wherever
  you're working — no need to switch working directories first.
- If the wire contract is substantial (a real API/message schema shared between repos), mirror it
  in a `docs/MESSAGING.md`-style file on both sides and keep it manually synchronized — same
  pattern as `geo-browser`/`geo-builder`'s `docs/MESSAGING.md`.

**Multiple consumers**: don't build a consumer registry, fan-out-on-breaking-changes, or a
rollout-tracking process ahead of a second real consumer — that's speculative process-building, the
same judgment call as the "don't build a DI factory/composition-root prematurely" note under Coding
Style. When a second consumer repo actually arrives, that's the trigger to design that extension,
not before.

## Collaboration rules

- Before implementing any feature or non-trivial change, ask clarifying questions until the intent is unambiguous.
- If anything is unclear or could be interpreted multiple ways, ask — do not assume and implement.

### Task workflow

Tasks are tracked as GitHub issues in this repo, status via labels: `status:brainstorm`,
`status:implementation`, `status:testing`, `status:ready-to-submit`, `status:ready-for-integration`
(only needed once this repo has a `cross-repo` relationship with another — see "Ready for
Integration" below). There is no `status:done` label — reaching Done means closing the issue.
(These labels don't exist on a freshly-created repo — create them with `gh label create` before
the first task needs one.)

Tasks come in two flavors, which affects whether step 1 below applies:

- **Planned tasks** — a `tasks/<task-name>.md` already exists (or is being freshly authored as a
  deliverable in its own right) before implementation discussion starts, e.g. dropped in by the
  user ahead of time. Follow all stages below, starting with Brainstorm.
- **Ad-hoc tasks** — the task emerges organically from conversation (no pre-existing or
  deliberately-authored task file). Skip straight to Implementation: no `tasks/<task-name>.md` gets
  created at all, just open the GitHub issue directly once the discussion has converged. Don't
  create a task file first just to immediately trim/delete it — that's churn, not documentation.

For any non-trivial feature or change, follow these stages:

1. **Brainstorm** (planned tasks only) — copy `tasks/new_task.md` to `tasks/<task-name>.md` with the problem statement; update it with conclusions as the design discussion progresses. This is scratch space for live back-and-forth — an issue isn't required at this stage, but a lightweight tracking issue labeled `status:brainstorm` can be opened for backlog visibility if wanted; either way, `tasks/<task-name>.md` (not the issue) stays the working document until the design converges.
2. **Implementation** — open a GitHub issue (`gh issue create`) with the converged problem statement + conclusions as the body, labeled `status:implementation`. Write the code. For a planned task, `tasks/<task-name>.md` is no longer the source of truth once the issue exists — trim it to a one-line pointer at the issue (or delete it) rather than maintaining both. For an ad-hoc task, there's no file to trim — the issue was the first artifact.
3. **Testing** — relabel the issue `status:testing`. Verify correctness; post test results and any open issues as an issue comment. **For a `cross-repo` issue that originated from a consumer repo's own testing/diagnosis**, this repo's own verification — even a live check against a real external dependency — confirms the fix works in isolation, but isn't the same as confirming the originally reported symptom is actually resolved: that requires the consumer to pull the updated code and re-test in its own context. Say so explicitly in the comment rather than implying it's fully confirmed.
4. **Ready to Submit** — relabel `status:ready-to-submit`. Run typecheck + tests; confirm docs are up to date; post a summary comment. This is as far as *this* repo's own work can confirm the issue.
5. **Ready for Integration** (`cross-repo` issues that need consumer-side verification only — see
   "Who closes an issue" below for which issues that is) — once the fix is actually merged/pushed,
   relabel `status:ready-for-integration` instead of leaving it at `status:ready-to-submit`. This
   is the label that actually names the gap: this repo's own checks can confirm the fix works in
   isolation, but not that the originally reported symptom is resolved — that needs the consumer to
   pull the update and re-test in its own context. An issue with no such downstream dependency (a
   same-repo bug, nothing cross-repo) skips this stage entirely — `status:ready-to-submit` is
   already its terminal pre-close state.
6. **Done** — close the issue after merge. For a planned task, delete `tasks/<task-name>.md` once the issue is closed — the issue (body + comments) is the sole source of truth from that point on, so there's no reason to keep a stale duplicate on disk. (Only applies when a real issue holds the full history; a Done task with no issue keeps its local file.) Ad-hoc tasks have nothing to delete.

**Who closes an issue**: applies to issues opened "in the family" — by the repo owner themselves
(directly, or via a cross-repo issue from one of their own other repos) — the normal case before
this project has any external contributors. In that case, whoever opened it is the one who closes
it, not automatically whoever did the implementation work: leave it open (at
`status:ready-for-integration` once pushed, if it needed that stage; otherwise
`status:ready-to-submit`) and say so; don't close it, and don't use GitHub's auto-closing
commit-message keywords (`Closes #N`, `Fixes #N`, `Resolves #N`) for it, since those close on push
regardless of who's supposed to have that call — use a non-closing reference instead (`Ref #N`,
`Part of #N`, `Addresses #N`). This matters most for `cross-repo` issues diagnosed from a
consumer's own testing: the opener is the one positioned to actually verify the fix in that
original context, so closing is their call, not a mechanical side effect of merging. The one
exception even within the family: an issue Claude opened itself mid-task (e.g. a
`status:implementation` issue opened while executing a planned/ad-hoc task in the same session)
can be closed directly, since Claude is the opener there.

**If an issue ever comes from a genuine external contributor** (not the repo owner or one of their
own other repos), this whole rule doesn't apply — follow normal GitHub OSS etiquette instead
(auto-close via a merged PR's `Closes #N` is fine, maintainer discretion applies). Revisit this
section if/when that actually happens; it's not a case worth designing for speculatively before a
real external contributor shows up.

## Before committing

Run these before every commit:

```bash
npm run typecheck
npm run test:run
```

## Documentation rule

After any change that affects the public interface, URL params, or persisted file formats, update the relevant docs:

- `CLAUDE.md` — commands, architecture notes
- `docs/ARCHITECTURE.md` — modules, data flow, contracts
- `docs/PROTOCOL.md` — URL query-string surface, file/wire format schemas

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Typecheck (also the lint gate -- see Coding Style)
npm run typecheck

# Test
npm test          # Vitest watch mode
npm run test:run  # Vitest single run (CI)

# Build
npm run build      # tsc + vite build -> dist/
npm run preview    # preview dist/ locally
```

Run a single test file:

```bash
npx vitest run tests/unit/foo.test.ts
```

## Architecture conventions

1. Internal state is modeled with explicit classes/interfaces, not loose untyped objects.
2. `protocols.ts` contains serializable data contracts only — plain types/interfaces describing data this project persists, receives, or shares (wire formats, storage schemas). No behavior, no methods.
3. `contracts.ts` contains behavioral interfaces (`interface`s for services, sinks, ports this project's own internals depend on — e.g. `Logger`, already scaffolded here). Behavior that merely *operates on* a data contract still belongs in a dedicated class, not bolted onto the data type itself.
4. Unit tests (`tests/unit/`) must run offline — `tests/setup.ts` stubs `fetch` globally to throw on any network call. Integration tests (`tests/integration/`), if this project ever has them, may hit real external services — that's a deliberate scope split, not a loophole in this rule. Note `vitest.config.ts` runs everything under `tests/` by default, so adding an integration suite means either a separate config/project or gating it behind a name pattern, not just dropping files under `tests/`.
5. Prefer explicit, readable TypeScript over clever abstractions.
6. Prefer constructor/parameter injection over module mocks for this project's *own* internals in tests — e.g. a component that talks to the outside world (network, storage, the clock) should take that dependency as a constructor/options-object argument, defaulting to the real implementation, so tests can pass a stub/fake instead of mocking a module. Module mocks are still the right tool for faking a *third-party* library's own internals (something you don't own) — the distinction is whether the thing being faked is your code or someone else's.
7. If this project ever grows beyond a single `src/` tree into a real monorepo (multiple publishable packages, e.g. via npm workspaces) — an intentionally rare case, not the default shape — give each package a name specific enough not to collide with another project's own package if either is ever consumed as a dependency elsewhere. Don't pre-build a workspace layout speculatively — this note exists so you don't have to rediscover the collision risk if the need actually arrives.
8. **Curate a public API surface, separate from internal implementation.** Even a single-tree project benefits from distinguishing "what's safe for another project to import" from "internal implementation, free to change" — don't rely on every export from every module being equally supported. If this project is ever consumed as a library, add an `index.ts` at the package root that re-exports only the actually-supported names, so consumers write `import { Thing } from "<project>"` rather than reaching into a specific internal file; the re-export list itself documents the contract. Don't build this ahead of a real consumer.
9. **Keep the internal dependency graph acyclic — break cycles with an interface, not a runtime workaround.** If two concrete modules would otherwise need each other, introduce an `interface` (per convention 3's `contracts.ts`) that one side depends on instead of the other's concrete type — this is the same seam convention 6's constructor-injection convention already creates, just framed as a graph property: depending on an abstraction instead of a concretion is what keeps the graph from looping back on itself. Verify this mechanically when it matters, not by feel: list every module's static top-level imports (`grep -E "^import" -r src/`) and confirm no module is reachable from itself by following them — a passing test suite is not proof the graph is acyclic, since import-order luck can mask a real cycle. A lazy/deferred `import()` can *mask* a cycle by moving it from module-load-time to call-time — that's a legitimate fallback for cases an interface genuinely can't reach, not the default fix. Reach for the interface first.

## Logging

- **Use `Logger`** (`import { getLogger } from "./services"`) — not bare `console.log`.
- `src/services.ts` holds a module-level `Logger` instance, wired in by `runtime/context.ts`'s `Context` at construction. Always access it via `getLogger()` (throws if called before `Context` is constructed) rather than holding a reference to the module-level variable.
- **Every feature logs action start, action end, and action error.** Exception: high-frequency handlers (pointer-move, scroll, per-frame render callbacks) are exempt from start/end logging — but only for the no-op case. If a handler produces a real state change (something a bug report would need to reconstruct), log that transition, gated on "did anything actually change" rather than firing every tick. A handler that never logs is exactly as undiagnosable as one with no logging at all.
- **Message length by severity**:
  - **Success (info)** — short: feature started, feature ended.
  - **Recoverable issues (warning)** — medium: enough context to understand what went wrong and why it was non-fatal.
  - **Errors (error/fatal)** — detailed: full context needed to reproduce and diagnose.
- **Level guide**:
  - `Logger.diagnostic` — one message per chunk of work, so a run's progress is visible and a hang is distinguishable from silence.
  - `Logger.info` — normal notable events (start, end, success, counts).
  - `Logger.warning` — recoverable problems (retries, skipped items).
  - `Logger.error` / `Logger.fatal` — unrecoverable failures. `fail()` (`src/errors.ts`) is the standard way to raise one: it logs then throws, so a hard failure is never silently swallowed by a `catch` that forgets to log.

## Log Categories

Every `Logger` call (`info`/`warning`/`diagnostic`/`error`/`fatal`) takes an optional trailing `category?: string`, defaulting to `DEFAULT_LOG_CATEGORY` (`"general"`) when omitted. A normal run only shows `"general"` — `?debug` in the query string (`Context.debug`) switches the console sink to show every category, no matter what it's called (`DefaultLogger`'s `showAllCategories`, wired from `Context.debug` at construction). `?logCategory=a,b` is also available as a manual allow-list for isolating exactly one category's noise without full debug verbosity.

**Precedence when both are present**: an explicit `?logCategory=` wins outright over `?debug`'s show-everything shorthand — `Context`'s constructor computes `showAllCategories` as `debug && logCategories === null`, so `?debug=1&logCategory=foo` shows only `["foo"]`, not every category. Getting this precedence backwards — a blanket `debug` flag silently overriding an explicit narrower category selection — is a real mistake made independently in more than one sibling project built on this same template lineage (`geo-browser`, `tpl-py`'s downstream instances) before being caught and fixed each time; the rule above and its regression test (`tests/unit/logging.test.ts`) exist specifically so this project doesn't make it a third time.

`?logCategoryExclude=a,b` (`Context`'s `logCategoryExclude`) is a third, subtractive axis on top of both: an excluded category is unconditionally suppressed, even under `?debug=1` or an explicit `?logCategory=` that also names it — checked first in `DefaultLogger.write()`, before `showAllCategories`/`enabledCategories` are even consulted.

**General principle** (name this explicitly when a new settings/flag surface is added, don't rediscover it from scratch): when two configuration knobs can both influence the same outcome, the more specific/targeted one wins wherever they'd otherwise disagree, not the more generic/blanket one; the generic one only falls back into play when the specific one was left at its implicit default. `?logCategory=` vs. `?debug` above is the origin case.

The canonical set of category names lives in one place, `src/logging.ts`'s `LogCategory` const object (`LogCategory.General`, ...) — a plain `const ... as const` object plus a derived union type, **not** a real TypeScript `enum`: `erasableSyntaxOnly` (see Coding Style below) forbids `enum` declarations because they emit runtime code beyond simple erasure. `Logger`'s `category` parameter itself stays a plain `string` (categories are an open set — tests and ad-hoc debugging exercise arbitrary names not in this list), so `LogCategory` is only the known/canonical list call sites should reference instead of retyping string literals. Add a new category here, not scattered next to whichever class happens to use it first.

Use a category for a class of high-volume diagnostic logging that's only useful when actively chasing a specific bug — noisy enough that always showing it would bury the "general" signal, but valuable enough to be worth a name so `?debug` (or `?logCategory=<name>`) can pull it back up on demand. Genuine anomalies (a defensive guard firing, something a bug report would need regardless of what's being actively debugged) stay on the default `"general"` category rather than being tagged — category is for expected-but-verbose diagnostic *volume*, not for hiding real problems.

Every new component — and existing components picking up meaningfully new code — is **entitled and encouraged** to add its own `LogCategory` entry and log verbosely under it: per-step state, intermediate values, anything useful while actively debugging that class but too noisy for a normal run. This is a standing invitation, not something to ask permission for each time. Verbose category logging is cheap to add while writing the code and expensive to retrofit later once a live bug forces the question. Default to adding the category up front.

## Testing Rules

Use Vitest with `happy-dom` (configured in `vitest.config.ts`).

Tests live under:

```text
tests/unit/
tests/stubs/
tests/fakes/
```

Terminology:

- `stub`: tiny DI contract implementation (see `tests/stubs/stubLogger.ts`).
- `fake`: lightweight subsystem simulation — models real behavior over a scoped surface (e.g. an in-memory store that actually persists/retrieves across calls within a test), as opposed to a stub's minimal contract satisfaction.

Rules:

- Unit tests run offline. `tests/setup.ts` stubs `fetch` globally to throw on any network call.
- Stub/fake our own contracts, not third-party libraries.
- Use DI instead of module mocks (see Architecture convention 6).
- Reset global singletons between tests. `tests/setup.ts` calls `Context.reset()` in `afterEach`.
- Prefer behavior/wiring assertions over pixel-perfect layout assertions.
- Avoid anonymous inline object fakes in tests — a small named stub/fake class (implementing the real interface) is more readable and reusable than an ad-hoc object literal cast to the interface type.

## Coding Style

The project favors explicit, readable TypeScript.

Avoid:

- clever terse one-liners
- heavy optional chaining when explicit branches are clearer
- anonymous inline object fakes in tests
- large inline lambdas
- module mocks when DI works

Prefer:

- explicit private fields
- explicit constructor assignment
- small named stub/fake classes
- dependency injection through options objects
- methods over large lambdas
- methods over free functions when behavior belongs semantically to a class

Because `erasableSyntaxOnly` is enabled (see `tsconfig.json`), do not use constructor parameter properties or real `enum` declarations — both emit runtime code beyond simple erasure:

```ts
// Bad
constructor(private readonly sink: TelemetrySink) {}

// Good
private readonly _sink: TelemetrySink;

constructor(sink: TelemetrySink) {
    this._sink = sink;
}
```

`src/logging.ts`'s `LogCategory` const-object pattern is the standard `enum` replacement — see Log Categories above.

**Don't build a DI factory/composition-root prematurely** — the same wait-for-evidence judgment as Architecture convention 7/8/9's "don't pre-build" notes applies to DI wiring itself. A function picking up its second or third injectable parameter is not yet a smell; extracting a shared factory/helper from a single data point risks guessing at the wrong abstraction shape. Wait for real duplication — a second call site needing the same wiring, or a parameter list that's genuinely grown unwieldy — before extracting one.

Project readability rule:

```text
If a lambda is more than one logical statement, promote it to a named method.
```

## Naming Rules

Files are camelCase:

```text
mapView.ts
runtime/context.ts
```

Classes and interfaces are PascalCase:

```ts
Context
Logger
DefaultLogger
```

Folder provides namespace; class uses the simplest meaningful name (e.g. `runtime/Context`, not `runtime/AppContext`).

## New Task

## Pending Tasks

## Completed Tasks
