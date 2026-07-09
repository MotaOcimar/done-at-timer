---
id: TK-027
title: Arrival icon sits left of the clock; drifting icon is an analog clock of the ETA
type: feature
status: done
specs: [SPEC-006]
---

# Arrival icon sits left of the clock; drifting icon is an analog clock of the ETA

## Context

TK-005 introduced a locked/drifting icon above the arrival clock, with the drifting
state shown by a `lucide` clock spinning as a whole — decorative, no meaning. User
feedback after testing:

1. The icon should sit **to the left of** the big clock, on the same line, so icon
   and time read as one aligned unit (not stacked).
2. The drifting clock should **mean something**: show the actual arrival time (ETA),
   not just spin. Decided with the user (options presented).

Refines SPEC-006; TK-005 is done/frozen, so this is a new ticket.

## Acceptance criteria

- [x] The state icon (locked and drifting) renders on the same horizontal line, to
      the left of the arrival clock, vertically centered.
- [x] In the drifting state, the icon is an analog clock whose hour and minute hands
      point to the arrival time (ETA); as the ETA drifts forward in real time, the
      hands follow.
- [x] The analog clock shows a second hand that sweeps continuously (sign of life).
- [x] Locked state keeps the static map-pin.
- [x] Accessible labels preserved (locked / drifting); state color preserved.
- [x] SPEC-006 updated.

## Design

Closed **with the user** (three options presented for the drifting icon):

- **Drifting = a custom analog clock face whose hands point to the ETA.** Chosen over
  "clock showing current wall time" and "static clock, no motion". Rationale (user's
  words): the icon should "show the real arrival time" — so the little clock mirrors
  the same value as the big digital ETA, and because the ETA climbs in real time
  while drifting (paused/overtime), the minute hand advances with it. **The motion is
  the drift**, not decoration.
- **Second hand sweeps continuously** (~60s/turn) for a visible sign of life,
  independent of the ETA value. Stylized, not wall-second-accurate — the meaning
  lives in the hour/minute hands.
- **New `AnalogClock` SVG component** (SRP): `lucide`'s Clock has fixed hands, so a
  small custom 24×24 SVG is needed to place hands at an arbitrary time. Hands use
  `currentColor` so the existing state-color inheritance (`labelClasses`) still works.
- **Locked stays `MapPin`** (static) — only its placement changes (moves left of the
  clock). Pin-vs-clock + color keep the locked/drifting contrast.
- **Layout:** icon and clock share one `flex items-center justify-center` row; icon
  scaled up (~w-11/sm:w-14) to sit optically beside the text-7xl/8xl number.

Out of scope: changing the locked metaphor; the progress bar; "N min left"; the
celebration card.

## Plan

- [x] Red: `AnalogClock.test.tsx` — hour/minute hands rotate to the angles implied by
      a given time; a sweeping second hand element exists.
- [x] Build `src/components/AnalogClock.tsx` (custom SVG, `currentColor`, role="img").
- [x] Add `.clock-second-hand` (reuses the `drift-spin` keyframe at 60s) to index.css;
      drop the now-unused whole-icon `.drift-spin` class.
- [x] Rework `ArrivalDisplay.tsx`: single flex row `[icon][clock]`; drifting renders
      `AnalogClock time={arrivalTime}`, locked renders `MapPin`, both left of the time.
- [x] Update TK-005 tests that asserted `drift-spin` on the whole icon → assert the
      analog clock (second hand present, hands reflect ETA).
- [x] Green: full suite (293 passing), lint, build, prettier check.
- [x] Update SPEC-006 + Log.
- [x] Move to `in-review`; user accepts on the running app → then `done` + commit
      (first ticket through the new Acceptance gate).

## Acceptance

Accepted by the user on 2026-07-09 ("ficaram ótimos"), after two in-review rounds on
the running app (icon left of the clock; analog clock hands tracking the ETA, second
hand sweeping in real time).

Review round 1 (adjustments made in-review, no new ticket — the gate working):

- Second hand now ticks with the **real current seconds** (via `useClock`'s now)
  instead of a decorative CSS sweep.
- Overtime clock color unified to **amber-500** to match the task card's overtime
  clock (`TaskCard.tsx`).
- Layout fixed so the **clock stays centered** in the card and the icon hangs to its
  left out of flow (absolute), instead of centering the icon+clock pair (which
  shifted the time to the right).

Review round 2:

- Second hand back to a **continuous smooth sweep** (user preferred it over the
  per-second tick), but now **phase-aligned to real time** via a negative CSS
  `animation-delay` — continuous _and_ realistic. Made opt-in via a `secondHand` prop
  on `AnalogClock` (the task-card clock in TK-028 omits it).
