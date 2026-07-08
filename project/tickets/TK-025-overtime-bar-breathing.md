---
id: TK-025
title: Overtime progress bar gently breathes (sign of life)
type: feature
status: done
specs: [SPEC-006, SPEC-010]
---

# Overtime progress bar gently breathes

## Context

In overtime the progress bar is fully static (solid amber) while the task's clock
keeps counting up — it reads as frozen. The running bar has a sweeping shimmer
(TK-015/023/024), but a forward sweep would wrongly imply planned progress in
overtime, which has already been exceeded ([SPEC-006], [SPEC-010]). A gentle
breathing (pulsing brightness) signals "still live / awaiting you" without
implying forward motion, cohesive with the amber clock text that already pulses.

## Acceptance criteria

- [ ] While a task is in overtime, its progress bar gently breathes (pulsing
      brightness), not a traveling sweep.
- [ ] To-do / running / paused / done bars are unaffected.
- [ ] SPEC-006 and SPEC-010 note the overtime bar's breathing.

## Design

Decision closed with the user (2026-07-08): **amber breathing pulse** (chosen over
a slower amber sweep or leaving it static). Applied to **both** overtime bars — the
task-card bar ([SPEC-010]) and the arrival-header bar ([SPEC-006]) — mirroring how
the running shimmer applies to both, for consistency.

Settled by codebase convention: a `.breathe` utility (opacity keyframe) in
`src/index.css`, applied to the fill when its state is `overtime`, next to the
existing `shimmer` gate. No component logic changes beyond the class toggle.

## Plan

- [x] RED: ProgressBar test — `state="overtime"` fill carries `breathe`;
      running/paused do not.
- [x] GREEN: add `.breathe` + `@keyframes breathe` to `src/index.css`.
- [x] GREEN: toggle `breathe` on overtime in `ProgressBar.tsx` and
      `ArrivalDisplay.tsx`; suite green (283 passing).
- [x] Update SPEC-006 and SPEC-010 (breathing note + Log).
- [x] Verify: lint/check/build clean, CSS emitted.
- [x] Close: check boxes, status `done`, update `tickets/INDEX.md`.
