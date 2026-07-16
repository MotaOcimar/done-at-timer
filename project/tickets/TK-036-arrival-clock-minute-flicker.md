---
id: TK-036
title: Arrival clock flickers between two consecutive minutes
type: bug
status: open
specs: [SPEC-005, SPEC-006]
---

# Arrival clock flickers between two consecutive minutes

## Context

Reported by the user (2026-07-15, occurring intermittently for a while): the
main arrival clock ([SPEC-006]) sometimes alternates between two consecutive
minutes (e.g. :35 ↔ :36) several times per second while a task is running.
The arrival time while running should be steady — the projection is anchored
([SPEC-005]); only drifting states (paused/overtime) move it.

**Mechanism (confirmed in code, 2026-07-15).** While a task runs, the true
arrival is a constant: `targetEndTime + sum of pending estimates`, and
`targetEndTime` is already in the store. But the display recomputes it as
`now + timeLeft` (`ArrivalDisplay.tsx:68` via `calculateArrivalTime`), where:

- `now` comes from `useClock`'s shared 1-second interval;
- `timeLeft` comes from a **separate, unsynchronized** `setInterval` owned by
  `ArrivalDisplay`'s own `useTimer` instance, as
  `ceil((targetEndTime − Date.now()) / 1000)`;
- a third private interval (`TaskItem`'s `useTimer`) writes
  `activeTaskTimeLeft` into the store each of _its_ ticks, feeding the task
  cards' ETAs the same way (`TaskList.tsx:71`).

Each interval fires at a different sub-second phase and each triggers a
render, so the computed arrival wobbles up to ~1s around the true constant.
Whenever the true arrival sits near a minute boundary, the displayed HH:MM
flips between the two adjacent minutes at sub-second cadence. Task-card ETAs
wobble identically; it is just most visible on the big clock.

Related: TK-019 (unify ticks onto `useClock`) removes the phase mismatch but
not the recompute-from-moving-clocks approach; TK-037 reshapes the state so
anchored values are the stored truth. This ticket is about the observable
bug and may be fixed narrowly or ride those refactors — decided at planning.

## Acceptance criteria

- [ ] While a task is actively running, the displayed arrival time (header
      and task-card ETAs) is stable — it never alternates between two values
      without an actual state change (pause, overtime, completion, edit).
- [ ] Drifting behavior is unchanged: paused/overtime arrival still advances
      smoothly with the wall clock ([SPEC-006]).
- [ ] Affected specs reviewed (likely no text change — this restores the
      behavior they already describe).

## Design

(direction, to finalize at planning)

- While running, anchor the display to the stored `targetEndTime` (+ pending
  sum) instead of deriving it from `now + timeLeft` sampled from independent
  intervals. `now` remains the base only in drifting/idle states, where the
  arrival genuinely moves with the clock.

## Plan

(to be written when work starts)
