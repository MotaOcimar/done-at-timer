---
id: TK-005
title: Arrival status icons (locked vs drifting)
type: feature
status: done
specs: [SPEC-006]
---

# Arrival status icons (locked vs drifting)

## Context

The arrival header ([SPEC-006]) signals a drifting arrival time with the text
"Arrival time is drifting". Text is easy to tune out; an icon next to the clock
would communicate the state at a glance. Migrated from `conductor/backlog.md`
(TK-001).

## Acceptance criteria

- [x] When the timer is running, a static map/GPS-pin icon appears next to the
      arrival clock, signaling the arrival time is "locked" to current progress.
- [x] When the timer is paused or in overtime, an animated/rotating clock icon
      appears instead, signaling the arrival time is drifting forward in real time.
- [x] The icons replace or augment the current "drifting" text (decide in Design).
      → Chosen: **replace** (icon-only), with the text preserved as an `aria-label`.
- [x] SPEC-006 is updated to describe the new state signaling.

## Design

Decisions (icon treatment closed **with the user**, per workflow):

- **Icon-only, replacing the visible state text** (user's choice — most minimalist;
  the giant clock already reads as "arrival time", so the "You will be done at" /
  "Arrival time is drifting" sentences are redundant visually). Out of the three
  options presented (augment / icon+short-label / icon-only), icon-only was chosen.
- **Accessibility safeguard:** the removed sentence is preserved as the icon's
  `aria-label` ("Arrival time is locked" / "Arrival time is drifting"), so screen
  readers lose nothing. This is what makes a bare glyph acceptable for a
  time-blindness audience.
- **Icon mapping keys off the existing `isDrifting` flag** (SPEC-006's locked vs
  drifting distinction), so one boolean drives both icon and color, no new state:
  - locked (idle + running) → static `MapPin` (GPS pin).
  - drifting (paused + overtime) → `Clock` with a slow, calm rotation (~6s/turn):
    rotation signals real-time drift without reading as an alarm/spinner.
- **Color stays state-driven:** the icon inherits the state color via `currentColor`
  (same `labelClasses` map the old `<h2>` used), preserving the running/paused/
  overtime color semantics specs rely on.
- `lucide-react` is already a dependency — no new package.

Out of scope: changing the celebration ("Well Done") card; the "N min left" readout;
any color/palette change.

## Plan

- [x] Red: add icon tests (locked while running/idle, rotating drifting icon when
      paused/overtime, mutual exclusivity, `drift-spin` class on the drifting icon).
- [x] Add `drift-spin` keyframe + class to `src/index.css` (slow calm rotation).
- [x] Replace the `<h2>` text label in `ArrivalDisplay.tsx` with the icon (MapPin /
      Clock) switched on `isDrifting`, carrying `aria-label` + state color class.
- [x] Update the existing tests that located the label by its visible text to
      locate the icon by `aria-label` instead (2 in ArrivalDisplay.test, 4 in
      ArrivalDisplay.color.test, plus App.test, integration.test, integration.sticky).
- [x] Green: full test suite (288 passing), `npm run lint`, `npm run build`.
- [x] Update SPEC-006 (state signaling now iconographic) + Log; flip ticket to done;
      update tickets/INDEX status to (done).
