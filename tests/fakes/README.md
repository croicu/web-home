# tests/fakes/

Lightweight subsystem simulations (as opposed to `tests/stubs/`'s tiny DI-contract
implementations) — a fake models real behavior over a scoped surface, e.g. an in-memory
store that actually persists/retrieves across calls within a test. See CLAUDE.md's Testing
Rules for the stub/fake distinction.

Empty until this project has a subsystem worth faking — don't pre-populate this speculatively.
