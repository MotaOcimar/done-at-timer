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
- To the **left of the clock**, on the same line, an **icon** reinforces whether the
  projection is holding or slipping. Holding (idle, or a task actively running) shows a
  static map-pin. Slipping — whenever no progress is being made while the wall clock
  advances (paused, or in overtime awaiting confirmation) — shows a small **analog
  clock whose hands point to the arrival time itself**; as the arrival time slides
  forward the hands follow it, and a second hand sweeps continuously — smoothly and in
  sync with real time — as a calm sign of life. The icon takes the state color (above).
- The clock **names itself** on demand. Because that big time is only ever an
  _estimate_ of arrival, tapping the whole clock group (or hovering / keyboard-focusing
  it) reveals a small text bubble reading **"Estimated arrival time"** — and, when the
  estimate is slipping, **"Estimated arrival time — slipping"**. The wording is
  deliberately neutral (never "late") so it informs without alarming a user with time
  blindness. That same string is the clock's accessible **description** for screen
  readers, while the time itself remains the accessible value — so the meaning rides
  along without overriding the number, and without cluttering the calm header. The
  state icon is decorative reinforcement of the same signal.
- Below the clock, a progress bar shows estimated minutes completed vs. total, with
  a "N min left" readout (estimates, per [SPEC-005]). While a task is actively
  running (not paused or in overtime), the bar shows continuous forward-flowing
  motion, signaling live progress; in overtime it instead gently breathes
  (pulsing brightness) to signal the task is still live.
- When **every task is done**, the display becomes a green celebration card
  ("Well Done") and confetti fires once.

## Implementation pointers

- `src/components/ArrivalDisplay.tsx`, `src/components/AnalogClock.tsx` (drifting
  clock face), `src/components/IconTooltip.tsx` (tap/hover meaning bubble),
  `src/App.tsx` (sticky wrapper)

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-015: running arrival progress bar shows forward-flowing motion instead of a pulse (2026-07-08)
- TK-025: overtime arrival progress bar gently breathes to signal it's still live (2026-07-08)
- TK-026: made the running sweep visible on the white arrival fill (blue tint) (2026-07-08)
- TK-005: locked/drifting now shown by an icon (static pin / rotating clock) instead of text, with an accessible label (2026-07-09)
- TK-027: icon moved to the left of the clock (same line); drifting icon is now an analog clock whose hands point to the ETA, with a second hand sweeping continuously in sync with real time; overtime clock color aligned to amber-500 (2026-07-09)
- TK-036: fixed the big clock (and card ETAs) flickering between two adjacent
  minutes while running — the display now shows the anchored arrival ([SPEC-005]);
  no behavior text changed (2026-07-16)
- TK-029: the arrival clock names itself on demand — tap/hover/focus the whole clock group reveals "Estimated arrival time" (and "— slipping" when drifting) as a bubble; that neutral, non-alarming text is the clock's accessible description while the time stays the value; the state icon became decorative reinforcement (2026-07-10)
