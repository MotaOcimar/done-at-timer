---
id: TK-028
title: Task card's overtime clock becomes an analog clock of the task's completion time
type: feature
status: done
specs: [SPEC-010]
---

# Task card's overtime clock becomes an analog clock of the task's completion time

## Context

TK-027 gave the arrival header an analog clock whose hands point to the ETA. The task
card ([SPEC-010]) shows a static `lucide` `Clock` glyph in the status-icon slot when a
task is in overtime — it carries no information. User feedback: make it the same kind
of analog clock, showing the task's **predicted completion time** (which, for an
overtime task, is the current time — it has already overrun). But **without a second
hand**, to avoid too much motion in a list of cards.

## Acceptance criteria

- [ ] In overtime, the task card's status icon is an analog clock whose hands point to
      the task's predicted completion time (its `eta`, which equals "now" in overtime).
- [ ] It has no second hand (calm — no per-second motion).
- [ ] Keeps the existing amber overtime treatment; color stays consistent with the
      arrival clock.
- [ ] SPEC-010 updated.

## Design

- User-directed (decided during TK-027's acceptance): reuse the `AnalogClock` from
  TK-027 in `TaskCard`'s overtime status icon, with `time = eta` and no second hand.
- `eta` is already passed to `TaskCard` (computed by `calculateIntermediateETAs`); for
  an `IN_PROGRESS` task in overtime that function clamps remaining to 0, so
  `eta === currentTime`. So "predicted completion" and "now" coincide, as the user
  noted. It updates each second via `useClock` in `TaskList`.
- No second hand: `AnalogClock`'s second hand is opt-in (`secondHand` prop, added in
  TK-027); the task card omits it.
- Color: the icon inherits the chip's `text-amber-500` via `currentColor` — the same
  amber the arrival overtime clock now uses (TK-027), so the two read identically.

Out of scope: the arrival display (TK-027); non-overtime task states; the per-task ETA
readout (the MapPin lines) — those stay as-is.

## Plan

- [x] Red: TaskCard test — in overtime the status icon renders an analog clock whose
      hands reflect `eta`, and no second hand is present.
- [x] Pass `eta` into `StatusIcon`; replace the overtime `<Clock>` with
      `<AnalogClock time={eta ?? new Date()} />` (no `secondHand`). Drop the now-unused
      `Clock` import.
- [x] Update SPEC-010 + Log.
- [x] Green: suite, lint, build, prettier. Move to `in-review` for user acceptance.

## Acceptance

Accepted by the user on 2026-07-09 ("ficaram ótimos") on the running app — overtime
task shows the analog clock of its completion time, no second hand.
