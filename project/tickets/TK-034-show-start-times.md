---
id: TK-034
title: Show start/departure times alongside every arrival time
type: feature
status: in-progress
specs: [SPEC-002, SPEC-006, SPEC-010, SPEC-011, SPEC-012]
---

# Show start/departure times alongside every arrival time

## Context

The app answers "when will I arrive?" everywhere — the arrival header
([SPEC-006]), per-task ETAs on cards ([SPEC-010]), and the routine finish
forecast (TK-032, [SPEC-011]). User request (2026-07-15): every arrival
estimate should be paired with an equally clear presentation of the **other
endpoint** — when the thing started, or is predicted to start:

- **Done tasks**: the time the task actually started.
- **Running task**: the time it actually started.
- **To-do tasks**: the predicted start time.
- **Arrival header**: the time the routine (session) started.
- **Routine rows in the library**: the departure time — the current time —
  made explicit, so the row reads as "leaving now at HH:MM, arriving at HH:MM".

## Acceptance criteria

- [ ] A done task card shows the wall-clock time the task actually started.
- [ ] The running task card shows the wall-clock time it actually started.
- [ ] Each to-do task card shows its predicted start time (which updates as
      preceding tasks run long or finish early, same as ETAs do).
- [ ] The arrival header shows the routine's start time: fixed at the first
      task's actual start once underway; before anything starts, it reads
      "now".
- [ ] Each routine row in the library pairs the departure with the finish
      forecast; a departure that is the advancing current time reads as the
      word "now", never as a numeric clock time.
- [ ] Departure/start times are visually distinguishable from arrival times
      via the route visual language (see Design).
- [ ] All copy stays calm and neutral, consistent with the app's tone.
- [ ] Affected specs are updated.

## Design

(decided with the user, 2026-07-15)

- **Visual language: a route, in the maps vocabulary the app already uses.**
  Departure/start is a **circle-dot** (the route-origin marker), connected to
  the arrival **map-pin** by a **dashed line**: `◉ 14:10 ┄┄ ⌖ 14:25`. The pin
  keeps its app-wide meaning ([SPEC-006], [SPEC-010], [SPEC-011]); the
  circle-dot + dashed line extend the same GPS metaphor rather than inventing
  a second symbol system. Rejected: an arrow between bare times (loses the
  origin marker), and text labels (too wide for 320px rows).
- **Routine-row tooltip (TK-032) is reworded, not removed.** With the pair
  explicit, "if started now" is visually self-evident, but the circle-dot is a
  new symbol that deserves naming (the TK-029 pattern). The expanded-preview
  tooltip becomes a short label naming the pair — direction: "Leaving now ·
  estimated arrival" (final English copy polished at implementation, calm
  tone).
- **"Routine start" in the arrival header = the first task's actual start**,
  fixed once the session is underway. Before any task has started, the ◉ shows
  the live current time (advancing with the clock) — "if you leave now" —
  matching the routine rows, so the pair is always complete. Rejected:
  list-load time (measures something the user doesn't feel as departure) and
  hiding ◉ while idle (the pair would vanish exactly when deciding to leave).
- **Data model**: tasks record nothing about when they started (`completedAt`
  and `actualDuration` only) — a `startedAt` moment must be recorded when a
  task starts ([SPEC-002]), surviving persistence ([SPEC-013]). Done tasks
  persisted before this feature have no start time: their card simply omits
  the ◉ endpoint (graceful degradation, no invented data).
- **Predicted start of a to-do task** = the same projection chain that already
  produces its ETA ([SPEC-005]): its ETA minus its own estimate. No new
  calculation model.
- **A live departure reads "now", not a numeric time** — user decision,
  2026-07-15. Wherever the ◉ endpoint tracks the current clock (routine rows'
  leaving-now forecast, the idle arrival header, a to-do task whose predicted
  start is the present moment), it renders the word "now" instead of HH:MM:
  `◉ now ┄┄ ⌖ 14:47`. This removes the cognitive step of comparing a numeric
  time against the clock to tell "current" from "some fixed time" — a numeric
  ◉ therefore always means a fixed moment (actual or predicted), never the
  advancing present. English copy direction: "now", polished at
  implementation.
- **Out of scope:** a departure time saved on a routine (that is TK-035, which
  builds on this ticket's routine-row pair); editing any of these times;
  header layout micro-placement (settled at implementation with a mockup at
  self-check, per the acceptance gate).

## Plan

(written 2026-07-16; design above was closed with the user on 2026-07-15.
`startedAt` recording/persistence already exists — TK-037 laid it as part of
the sources-of-truth reshape, so this ticket is UI + projection only.)

- [ ] Red/Green: shared `RoutePair` component — circle-dot origin + dashed
      connector + pin arrival; renders a live origin as the word "now";
      origin omissible (legacy done tasks); completed-pin variant.
- [ ] Red/Green: task cards — done shows actual start (◉ omitted when
      absent), running shows actual start under the progress bar, to-do
      shows predicted start (= ETA − own estimate; the word "now" when the
      predicted start is not in the future).
- [ ] Red/Green: arrival header — start endpoint paired with the big clock:
      live "now" before anything starts, fixed at the first task's actual
      start (earliest recorded start) once underway.
- [ ] Red/Green: routine rows — pair the forecast as `◉ now ┄ ⌖ HH:MM`;
      tooltip copy becomes "Leaving now · estimated arrival".
- [ ] Specs: update SPEC-006, SPEC-010, SPEC-011; review SPEC-002 (start
      moment likely already there via TK-037) and SPEC-012 for touches.
- [ ] Full suite + lint + format; self-check on the running app (verify
      skill), then `in-review` for the user's acceptance (header
      micro-placement explicitly open to veto there).

## Notes

- Groundwork for TK-035 (saved departure time on routines).
