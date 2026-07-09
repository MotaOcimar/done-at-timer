---
id: SPEC-006
title: Arrival display (sticky header)
status: implemented
links: [SPEC-005, SPEC-001]
---

# Arrival display

The arrival time is the hero of the interface:

- A large clock (24h, HH:MM) showing the main arrival time ([SPEC-005]) sits at the
  top and **stays visible while scrolling** (sticky), so the ETA is never lost in a
  long list.
- The display has four visual states, in the app's calm palette ([SPEC-001]):
  **idle** (neutral, no task running), **running** (blue), **paused** (muted gray),
  **overtime** (soft amber — signal, not alarm).
- Above the clock, an **icon** signals whether the projection is **locked** or
  **drifting**: a static map-pin when locked (idle, or a task actively running), and
  a slowly, calmly rotating clock when drifting — drifting whenever no progress is
  being made while the wall clock advances: paused, or in overtime awaiting
  confirmation. The icon takes the state color (above) and carries an accessible
  label ("Arrival time is locked" / "Arrival time is drifting") for screen readers,
  so the distinction survives without visible text.
- Below the clock, a progress bar shows estimated minutes completed vs. total, with
  a "N min left" readout (estimates, per [SPEC-005]). While a task is actively
  running (not paused or in overtime), the bar shows continuous forward-flowing
  motion, signaling live progress; in overtime it instead gently breathes
  (pulsing brightness) to signal the task is still live.
- When **every task is done**, the display becomes a green celebration card
  ("Well Done") and confetti fires once.

## Implementation pointers

- `src/components/ArrivalDisplay.tsx`, `src/App.tsx` (sticky wrapper)

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-015: running arrival progress bar shows forward-flowing motion instead of a pulse (2026-07-08)
- TK-025: overtime arrival progress bar gently breathes to signal it's still live (2026-07-08)
- TK-026: made the running sweep visible on the white arrival fill (blue tint) (2026-07-08)
- TK-005: locked/drifting now shown by an icon (static pin / rotating clock) instead of text, with an accessible label (2026-07-09)
