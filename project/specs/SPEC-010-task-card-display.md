---
id: SPEC-010
title: Task card (per-task display & controls)
status: implemented
links: [SPEC-002, SPEC-004, SPEC-005, SPEC-008]
---

# Task card

Each task is a card showing its title, its estimate, and its own ETA inline
([SPEC-005]) — the "GPS checkpoint" for that step.

Visual states mirror the arrival display's palette:

- **To-do:** neutral, with a play button to start the task.
- **Running:** highlighted in blue, with live countdown and progress; controls to
  pause/resume and a "Done" button to confirm completion ([SPEC-004]). While
  actively running, the progress bar shows continuous forward-flowing motion,
  signaling live momentum (only in this state — paused/overtime bars are static).
- **Paused:** muted gray (pausing is a neutral, intentional act — not a warning).
- **Overtime:** soft amber, still awaiting the user's confirmation. The progress
  bar gently breathes (pulsing brightness) to show the task is still live —
  distinct from the running bar's forward-flowing sweep. Its status icon is a small
  analog clock reading the task's projected completion time — which, having overrun,
  is the current time; it has no second hand, keeping a list of cards calm.
- **Done:** subtle green (readable, not washed out), showing the moment it was
  completed and the **real time spent, with the original estimate struck through**
  beside it — the honest comparison between plan and reality.

Title and duration are editable in place ([SPEC-008]).

## Implementation pointers

- `src/components/TaskCard.tsx`, `src/components/AnalogClock.tsx` (overtime status
  icon), `src/utils/cardState.ts`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-015: running progress bar shows forward-flowing motion instead of a pulse (2026-07-08)
- TK-025: overtime progress bar gently breathes to signal it's still live (2026-07-08)
- TK-028: overtime status icon is now an analog clock of the task's completion time, no second hand (2026-07-09)
