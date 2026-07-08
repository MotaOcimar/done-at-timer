---
id: TK-023
title: Refine the active-bar shimmer to a single soft sweep (no barber-pole)
type: chore
status: done
specs: []
---

# Refine the active-bar shimmer to a single soft sweep

## Context

TK-015 replaced the progress-bar pulse with a "flowing gradient wave", implemented
as a repeating -45° translucent-stripe gradient. In practice it reads as a
**barber pole**: hard edges and a stark contrast between the two colors. The
intended feel is a **single soft pulse of light that glides from one side to the
other**, with a smooth gradient transition (a soft glow, no visible stripes).

Behaviorally this still satisfies SPEC-006 and SPEC-010 ("the running bar shows
continuous forward-flowing motion signaling live progress") — those specs are
implementation-agnostic and unchanged. This is a purely visual refinement of the
`.shimmer` utility; no component/logic changes.

## Acceptance criteria

- [ ] The active bar shows a single soft highlight sweeping left→right (not a
      repeating stripe pattern), with soft/transparent edges (smooth degradê).
- [ ] No hard-edged, high-contrast stripes remain.
- [ ] The `shimmer` class wiring is untouched (ProgressBar/ArrivalDisplay still gate
      it on active), so the existing ProgressBar test keeps passing.

## Design

Decision closed with the user (2026-07-08): drop the repeating diagonal stripe
gradient. Implement `.shimmer` as a full-width soft highlight band
(`transparent → white → transparent`) rendered in a `::after` overlay and
translated from off-left to off-right, with a short hold at the end so it reads as
a distinct single pulse that repeats. The solid state color stays underneath, so
per-state palette semantics remain untouched.

Trivial chore: no new logic, so no new unit test — the existing ProgressBar test
already guards that active bars carry the `shimmer` class; the change lives
entirely inside the CSS definition.

## Plan

- [x] Rewrite `.shimmer` + `@keyframes shimmer` in `src/index.css` (soft `::after`
      sweep instead of the repeating stripe gradient).
- [x] Verify: existing suite green (12 affected tests pass), `npm run lint`/`check`/
      `build` clean, `.shimmer::after` + `@keyframes shimmer` confirmed in `dist` CSS.
- [x] Close: check boxes, set status `done`, update `tickets/INDEX.md`.
