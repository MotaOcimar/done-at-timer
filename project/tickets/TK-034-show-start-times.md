---
id: TK-034
title: Show start/departure times alongside every arrival time
type: feature
status: in-review
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

- [x] Red/Green: shared `RoutePair` component — circle-dot origin + dashed
      connector + pin arrival; renders a live origin as the word "now";
      origin omissible (legacy done tasks); completed-pin variant. (dc5c1a2)
- [x] Red/Green: task cards — done shows actual start (◉ omitted when
      absent), running shows actual start under the progress bar, to-do
      shows predicted start (= ETA − own estimate; the word "now" when the
      predicted start is not in the future). (dc5c1a2)
- [x] Red/Green: arrival header — start endpoint paired with the big clock:
      live "now" before anything starts, fixed at the first task's actual
      start (earliest recorded start) once underway. Placed at the left of
      the progress footer, opposite "N min left". (dc5c1a2)
- [x] Red/Green: routine rows — pair the forecast as `◉ now ┄ ⌖ HH:MM`;
      tooltip copy becomes "Leaving now · estimated arrival". (dc5c1a2)
- [x] Specs: SPEC-006, SPEC-010 (defines the route-pair vocabulary),
      SPEC-011 updated. Reviewed with no text change needed: SPEC-002 (the
      start moment was already modeled there by TK-037) and SPEC-012 (row
      presentation details live in SPEC-011, which it references).
- [x] Full suite + lint + format (353 tests green, build passes);
      self-check on the running app (verify skill, headless browser) —
      10/10 checks: to-do chain predicts starts ("now" → first ETA), actual
      starts on running/done cards, header start fixed through pause and
      auto-advance. Moved to `in-review`.

- [x] Review refinement (user, 2026-07-16): on task cards the pair stacks
      **vertically** — origin above, arrival below, dashed segment between
      the glyphs — instead of the inline form. Header and routine rows stay
      horizontal.
- [x] Review refinement (user, 2026-07-16): the route glyphs were reading
      slightly bigger than the numbers — now sized relative to the host
      text (0.75em), slightly under the digit height, everywhere the pair
      or the header ◉ appears.
- [x] Review refinement (user, 2026-07-17): optical alignment inverted — the
      glyphs hold the line-box center and the numeric times take a small
      downward nudge to meet them; the word "now" (lowercase, x-height)
      already sits there and stays put. Retuned by eye to translate-y 0.03em,
      applied wherever the pair or the header ◉ appears.
- [x] Review refinement (user, 2026-07-17): the routine-row forecast now
      inherits the row's gray, matching the "N tasks · total" metadata beside
      it (dropped its own darker `text-gray-500` override).
- [x] Review refinement (user, 2026-07-17): the **active** card
      (running/paused/overtime) reads **horizontally** instead of stacking —
      start left, ETA right, no connecting path — mirroring the arrival
      header's start/remaining row, so the running card no longer grows
      taller than it needs to. To-do and done cards keep the vertical
      itinerary. New `spread` variant on `RoutePair`; SPEC-010 updated.
- [x] Review refinement (user, 2026-07-17): in overtime, only the **arrival**
      endpoint pulses — it advances with the clock (target is in the past, so
      the ETA is "now"), so it reads as the live endpoint. The **start** stays
      still: a fixed past moment shouldn't draw attention to a time that won't
      change. New `pulseArrival` variant on `RoutePair`; the whole time
      display no longer pulses. SPEC-010 updated.

> State: implementation complete, awaiting the user's manual acceptance on
> the running app. Open to veto there: header start placement (left of the
> progress footer) and the lowercase "now" styling inside uppercase label
> rows. TK-036 is also at `in-review`.

## Notes

- Groundwork for TK-035 (saved departure time on routines).
