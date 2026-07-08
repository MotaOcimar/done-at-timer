---
id: TK-024
title: Shimmer polish — constant-width beam and a slightly slower sweep
type: chore
status: done
specs: []
---

# Shimmer polish — constant-width beam and a slightly slower sweep

## Context

Follow-up to TK-023 (single soft sweep). Two issues surfaced when testing on
device:

1. The sweep is a touch too fast (~1.9s cycle).
2. The beam **widens as progress advances**: the `::after` fills the progress
   fill (`inset: 0`) and the highlight is 50% of the gradient, so as the fill grows
   the highlight grows in absolute size too.

Purely visual; specs (SPEC-006 / SPEC-010) stay implementation-agnostic and
unchanged. The overtime "sign of life" idea is tracked separately (TK-025).

## Acceptance criteria

- [ ] The highlight keeps a **constant absolute width** regardless of task progress.
- [ ] The sweep is slightly slower than TK-023's ~1.9s (but not sluggish).
- [ ] Still a single soft pulse with soft edges; wiring/tests untouched.

## Design

Decisions closed with the user (2026-07-08):

- **Constant width:** give the beam a fixed size instead of a percentage of the
  fill. The `::after` becomes a fixed-width band (a soft `transparent → white →
transparent` gradient) that slides across the fill via an animated `left`,
  clipped by the fill's `overflow: hidden`. Its width no longer tracks progress.
- **Speed:** ~2.5s cycle (was 1.9s), keeping the 60% sweep / 40% rest split so it
  still reads as a distinct, repeating single pulse.

## Plan

- [x] Rewrite `.shimmer::after` + `@keyframes shimmer` in `src/index.css`
      (fixed-width band, `left` sweep, ~2.5s).
- [x] Verify: suite green, lint/check/build clean, CSS emitted in `dist`
      (`width:6rem`, `left:-6rem→100%`, `2.5s`).
- [x] Close: check boxes, set status `done`, update `tickets/INDEX.md`.
