---
id: TK-019
title: Unify timer ticks — useTimer consumes useClock's now
type: chore
status: done
specs: [SPEC-003]
---

# Unify timer ticks — useTimer consumes useClock's now

## Context

`useTimer` maintains its own `setInterval` ticks while `useClock` already provides
a synchronized "now" — duplicate tick logic and two sources of truth for
time-based calculations. Refactor `useTimer` to consume `useClock`, keeping every
behavior guaranteed by [SPEC-003] (real-time anchoring, pause, overtime) intact.
Migrated from `conductor/backlog.md` (TK-001).

## Acceptance criteria

- [x] A single tick source drives all time-based calculations.
- [x] All existing timer tests pass unchanged — no observable behavior change, so
      SPEC-003 stays accurate as written.

## Design

(settled 2026-07-16 — technical, single obvious shape; recorded for review)

- `useTimer` subscribes to `useClock` and loses both of its own
  `setInterval`s. Public API unchanged.
- **Anchored mode** (`targetEndTime` set): `timeLeft` is recomputed from the
  target against the shared clock's `now` on every tick; the TK-030 re-arm
  stays keyed to target changes only (a tick must never re-arm the latch).
- **Legacy mode** (no target): decrements once per shared-clock tick while
  running. A ref guards against non-tick re-renders (pause/resume) eating a
  second; the deferred completion latch is untouched.
- A test pins the architecture: mounting several timers plus a clock consumer
  creates exactly **one** interval.
- Note for TK-036: after this, the arrival header's `now` and `timeLeft`
  come from the same tick, so the minute flicker should become rare — but the
  root fix (displaying the anchored value) remains TK-036's job.

## Plan

- [x] Red: pin test — multiple `useTimer`s + `useClock` consumers share one
      interval. (fc3a2a8)
- [x] Green: refactor `useTimer` onto `useClock`; all existing timer tests
      pass unchanged. (fc3a2a8)
- [x] Full suite + lint + format. (335 tests green, lint & prettier clean,
      build passes)

## Notes

Two implementation details surfaced while going Green, both within the
settled Design:

- **Batched ticks:** React batches several shared-clock ticks fired inside one
  task into a single render, so legacy mode counts the whole seconds elapsed
  between consumed ticks instead of "one render = one second".
- **Derived, not stored:** the `react-hooks/set-state-in-effect` lint rule
  rejected recomputing the anchored value inside an effect, so anchored
  `timeLeft` is derived at render (TK-037 spirit). State keeps a copy in sync
  via React's "adjusting state during render" pattern, preserving the old
  behavior of consumers that clear `targetEndTime` on pause and expect the
  last value to hold still.

Next per the agreed order: TK-036 → TK-034 → TK-035.
