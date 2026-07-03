---
id: TK-020
title: Fix the 25 lint errors breaking npm run lint
type: chore
status: done
specs: []
---

# Fix the 25 lint errors breaking `npm run lint`

## Context
`npm run lint` fails on `main` with 25 errors (found while verifying TK-018, which
touched none of the affected files). Three groups:

1. **Unused vars in framer-motion test mocks** (~20 errors) — the mocks in
   `TaskItem.test.tsx`, `TaskItem.swipe.test.tsx` and `TaskList.test.tsx`
   destructure motion props (`drag`, `dragConstraints`, `onDragEnd`, `animate`, …)
   just to strip them before rendering, and the linter flags them as unused.
2. **Unused catch/placeholder vars** — `_`/`__` in `src/hooks/useSwipeToReveal.ts:49`
   and `catch (e)` in `src/utils/haptics.ts:5`.
3. **`Cannot access refs during render`** — `src/hooks/useSwipeToReveal.ts:99,104`.
   Not a style issue: reading refs during render is a real React correctness
   hazard. Needs investigation; if it manifests as observable misbehavior in
   swipe-to-delete, that's a bug against SPEC-009 and this ticket's `specs:` list
   must be updated accordingly.

A broken lint hides new errors, so this rots fast — that's the "why now".

## Acceptance criteria
- [x] `npm run lint` exits clean (0 errors, 0 warnings).
- [x] Group 3 is resolved by fixing the render-time ref access (or, if analysis
      shows the pattern is safe and intended, by an explicitly justified disable
      comment — not a blanket rule change).
- [x] No behavior change: full test suite passes unchanged.

## Notes
For groups 1–2, prefer the idiomatic fixes (rest-destructuring with a lint-aware
pattern, omitting the unused catch binding) over disable comments.

### Resolution (2026-07-03)
- **Group 1**: tuned `@typescript-eslint/no-unused-vars` with
  `ignoreRestSiblings: true` + `argsIgnorePattern: '^_'` in `eslint.config.js` —
  the standard options for the destructure-to-strip and intentionally-unused-arg
  idioms, not a rule disable.
- **Group 2**: `catch (e)` → bare `catch` in `haptics.ts`; `handleDragStart`
  params renamed to `_event`/`_info` (kept for framer-motion signature
  compatibility — `TaskItem` forwards args uniformly).
- **Group 3**: the render-time ref read was genuinely fragile — it relied on the
  parent re-rendering to propagate a fresh value. Converted `isSwipeActiveRef` to
  `useState` (TDD: the new hook test failed against the ref version, passed with
  state; repeated `setState(true)` during drag is a React bailout, so no render
  cost). No observable misbehavior existed in the UI path, so no bug against
  SPEC-009 and `specs:` stays empty.
- **Unmasked error**: fixing group 3 let the react-hooks compiler analysis
  continue and flag a pre-existing `set-state-in-effect` in the auto-dismiss
  effect of `useSwipeToReveal`. Replaced the effect with the React-documented
  render-time adjustment guarded by the previous `activeSwipeId` (behavior
  covered by existing auto-dismiss tests).
- 231 tests pass (229 pre-existing + 2 new for `isSwipeActive`).
