---
id: TK-022
title: Make npm run check pass — Prettier the whole repo
type: chore
status: open
specs: []
---

# Make `npm run check` pass — Prettier the whole repo

## Context

Discovered while closing TK-021: `npm run check` (Prettier) fails on ~150
pre-existing files, so the check is useless as a gate — new code can't be
verified against a baseline that was never green. TK-020 fixed ESLint but not
Prettier. Files created by TK-021 are already clean.

## Acceptance criteria

- [ ] `npm run check` exits clean on the whole repo.
- [ ] No behavior change: `npm test` and `npm run build` still pass; the commit is
      formatting-only (plus any config fix Prettier needs).

## Notes

Trivial mechanically (`npm run format`), but it touches almost every file — do it
in a dedicated commit with nothing else mixed in, ideally when no feature branch
is in flight.
