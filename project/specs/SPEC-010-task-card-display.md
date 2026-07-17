---
id: SPEC-010
title: Task card (per-task display & controls)
status: implemented
links: [SPEC-002, SPEC-004, SPEC-005, SPEC-008]
---

# Task card

Each task is a card showing its title, its estimate, and its own journey — when
it starts (or started) paired with when it finishes ([SPEC-005]) — the "GPS
checkpoint" for that step.

**The route pair.** Both endpoints render in the app's maps vocabulary: a
**circle-dot** (route origin) for the start, joined by a **dashed path** to the
**map-pin** (arrival) for the finish. On to-do and done cards the pair stacks
**vertically** — origin above, arrival below, like an itinerary. On the
**active** card (running/paused/overtime) it reads **horizontally**, the
endpoints pushed to opposite edges — start on the left, arrival on the right,
with **no connecting path** — mirroring the arrival header's start/remaining
row, so a running card does not grow taller than it needs to. Elsewhere
(arrival header, routine rows) it reads inline — `◉ 14:10 ┄ ⌖ 14:25`. Times
are 24-hour HH:MM. An origin that tracks the advancing present reads as the word **"now"**
(lowercase, calm) — a numeric origin always means a fixed moment, actual or
predicted, so the user never has to compare a number against the clock to tell
"current" from "scheduled". This vocabulary is shared with the arrival header
([SPEC-006]) and routine rows ([SPEC-011]).

Visual states mirror the arrival display's palette:

- **To-do:** neutral, with a play button to start the task. Its route pair
  shows the **predicted start** — its ETA minus its own estimate, the same
  projection chain as the ETA ([SPEC-005]) — which reads "now" whenever it is
  not in the future (first in line, or everything before it has overrun).
- **Running:** highlighted in blue, with live countdown and progress; controls to
  pause/resume and a "Done" button to confirm completion ([SPEC-004]). While
  actively running, the progress bar shows continuous forward-flowing motion,
  signaling live momentum (only in this state — paused/overtime bars are static).
  Under the bar, the route pair shows the moment the task **actually started**
  ([SPEC-002]) on the left, its live ETA on the right — spread across the
  footer with no connecting path.
- **Paused:** muted gray (pausing is a neutral, intentional act — not a warning).
- **Overtime:** soft amber, still awaiting the user's confirmation. The progress
  bar gently breathes (pulsing brightness) to show the task is still live —
  distinct from the running bar's forward-flowing sweep. Its status icon is a small
  analog clock reading the task's projected completion time — which, having overrun,
  is the current time; it has no second hand, keeping a list of cards calm.
  In the footer pair, only the **arrival** pulses — having overrun, it advances
  with the clock and reads as the live endpoint; the **start** stays still, a
  fixed past moment that should draw no attention to a time that will not change.
- **Done:** subtle green (readable, not washed out), showing when the task
  **actually started and was completed** (its route pair, checked pin) and the
  **real time spent, with the original estimate struck through** beside it —
  the honest comparison between plan and reality. Records persisted before the
  start moment existed show the arrival endpoint alone (no invented data).

Title and duration are editable in place ([SPEC-008]).

## Implementation pointers

- `src/components/TaskCard.tsx`, `src/components/RoutePair.tsx` (the route pair),
  `src/components/AnalogClock.tsx` (overtime status icon), `src/utils/cardState.ts`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-015: running progress bar shows forward-flowing motion instead of a pulse (2026-07-08)
- TK-025: overtime progress bar gently breathes to signal it's still live (2026-07-08)
- TK-028: overtime status icon is now an analog clock of the task's completion time, no second hand (2026-07-09)
- TK-034: every ETA became a route pair — circle-dot start joined to the map-pin
  arrival; actual starts on running/done cards, predicted starts on to-do cards,
  live starts read as the word "now"; review refinement: on cards the pair
  stacks vertically (2026-07-16)
- TK-034 review: the active card's pair reads horizontally instead — start
  left, ETA right, no connecting path, mirroring the arrival header — so the
  running card stops growing taller; to-do and done cards keep the vertical
  stack (2026-07-17)
- TK-034 review: in overtime only the arrival endpoint pulses (it advances
  with the clock); the fixed start no longer pulses (2026-07-17)
