---
id: TK-022
title: Make npm run check pass — Prettier the whole repo
type: chore
status: done
specs: []
---

# Make `npm run check` pass — Prettier the whole repo

## Context

Discovered while closing TK-021: `npm run check` (Prettier) fails on ~150
pre-existing files, so the check is useless as a gate — new code can't be
verified against a baseline that was never green. TK-020 fixed ESLint but not
Prettier. Files created by TK-021 are already clean.

## Acceptance criteria

- [x] `npm run check` exits clean on the whole repo.
- [x] No behavior change: `npm test` and `npm run build` still pass; the commit is
      formatting-only (plus the config fix and test fixup below).

## Notes

Trivial mechanically (`npm run format`), but it touches almost every file — do it
in a dedicated commit with nothing else mixed in, ideally when no feature branch
is in flight.

## Resolution

- Added `.prettierignore` excluding `conductor/` (the frozen archive — `workflow.md`
  says _never edit it_, so it must not be reformatted), plus `dist/` and `coverage/`
  build output. This is the "config fix Prettier needs" the ticket anticipated.
- Ran `npm run format` over the live tree (`src/`, `project/`, repo root): 98 files.
- Prettier normalised the PWA `<meta>`/`<link>` tags in `index.html` to self-closing
  (`… />`). `src/pwa.test.ts` pinned the exact non-self-closed strings for 5 of them
  (while already expecting `/>` on the `icon.svg` link — internally inconsistent), so
  those 5 assertions were updated to the self-closing form. Semantics unchanged.
- `npm run check` clean, `npm test` 282/282 green, `npm run build` succeeds.
