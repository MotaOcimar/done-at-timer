---
id: TK-026
title: Arrival-bar shimmer is invisible on the white running fill
type: bug
status: done
specs: [SPEC-006]
---

# Arrival-bar shimmer is invisible on the white running fill

## Context

SPEC-006 states the running arrival progress bar shows continuous forward-flowing
motion. In practice the arrival card's running fill is white (`bg-white/90` on a
blue-600 card), and the shimmer highlight is also white
(`rgba(255,255,255,0.45)`), so the sweep is effectively invisible — the spec's
motion cue isn't delivered. The task-card bar is unaffected (its running fill is
blue, so the white sweep contrasts).

## Acceptance criteria

- [ ] The shimmer sweep is clearly visible on the arrival bar while running.
- [ ] The task-card bar's white sweep is unchanged (still contrasts on blue).

## Design

Decision closed with the user (2026-07-08): on the white arrival bar the sweep
becomes a soft **blue** tint (on-palette with the blue card), since nothing reads
as "brighter than white" — a light sweep must darken/tint to be seen.

Make the shimmer highlight color a CSS custom property (`--shimmer-color`,
defaulting to the current translucent white so the blue task-card bar is
untouched), and set a translucent blue value on the arrival running fill via a
small `.shimmer-blue` helper class. No component logic changes beyond adding the
class next to the existing `shimmer` gate.

## Plan

- [x] RED: ArrivalDisplay test — a running task's progress fill carries the blue
      shimmer tint class.
- [x] GREEN: drive `.shimmer::after` color from `var(--shimmer-color, …white…)`;
      add `.shimmer-blue` (translucent blue) in `src/index.css`.
- [x] GREEN: add `shimmer-blue` to the arrival fill when running; suite green (284).
- [x] Verify: lint/check/build clean, CSS emitted (`#2563eb99` blue tint).
- [x] Close: check boxes, status `done`, update `tickets/INDEX.md`.
