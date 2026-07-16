---
id: TK-036
title: Arrival clock flickers between two consecutive minutes
type: bug
status: in-review
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

(finalized 2026-07-16 — carries out the direction recorded above; single
obvious shape given the codebase, recorded for review)

- **Fix at the ETA-calculation seam.** `calculateIntermediateETAs` (and
  `calculateArrivalTime` above it) learns the stored anchor: the active
  task's ETA becomes `max(now, targetEndTime)` when a target exists, and
  stays `now + remaining` only when it doesn't (paused). The `max` keeps
  SPEC-005's overtime rule for free: a future target is the stable anchor;
  a past target degrades to "everything starts from now", which genuinely
  drifts — exactly SPEC-006's slipping states.
- Both consumers pass the store's `targetEndTime` through: the header
  (`ArrivalDisplay`) and the task-card ETAs (`TaskList`). One fix covers
  both surfaces named in the acceptance criteria.
- **Observable rounding nuance:** while running, the displayed HH:MM becomes
  the target's own minute. The old `now + ceil(remaining)` could land up to
  1s later and show the _next_ minute near a boundary (the flicker's other
  half). Showing the anchored moment's minute is the correct value.
- **No spec text change expected:** while running, `now + remaining` and
  `targetEndTime` are the same instant by construction; stability is what
  SPEC-005/SPEC-006 already describe.
- Out of scope: removing `ArrivalDisplay`'s `useTimer` (still feeds the
  progress bar and the paused arrival); TK-037's broader state reshaping;
  any change to drifting behavior.

## Plan

- [x] Red: unit tests (`time.test.ts`) — with a target, the active ETA is
      the target itself regardless of `now`'s sub-second phase; past target
      falls back to now; no target (paused) keeps `now + remaining`. (1e51b79)
- [x] Red: component test (`ArrivalDisplay.test.tsx`) — running with a
      target just under a minute boundary shows the target's minute, stable
      across ticks. (1e51b79)
- [x] Green: thread `targetEndTime` through `calculateIntermediateETAs` /
      `calculateArrivalTime` and both call sites. (1e51b79)
- [x] Full suite + lint + format. (340 tests green)
- [x] Self-check on the running app (verify skill, headless browser): anchored
      arrival correct and stable across ~8s of ticks, card ETAs stable, static
      pin while running, paused arrival drifts to the next minute, resume
      stable again — 6/6 checks passed. Moved to `in-review`.

> State: implementation complete, awaiting the user's manual acceptance on
> the running app (acceptance gate). Next per the agreed order: TK-034 →
> TK-035 — but those need design closed with the user before work starts.
