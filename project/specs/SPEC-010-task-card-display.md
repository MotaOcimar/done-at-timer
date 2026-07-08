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
- **Overtime:** soft amber, still awaiting the user's confirmation.
- **Done:** subtle green (readable, not washed out), showing the moment it was
  completed and the **real time spent, with the original estimate struck through**
  beside it — the honest comparison between plan and reality.

Title and duration are editable in place ([SPEC-008]).

## Implementation pointers

- `src/components/TaskCard.tsx`, `src/utils/cardState.ts`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-015: running progress bar shows forward-flowing motion instead of a pulse (2026-07-08)
