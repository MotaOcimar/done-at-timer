---
id: TK-032
title: Show the time a routine would finish if started now
type: feature
status: open
specs: [SPEC-011, SPEC-012]
---

# Show the time a routine would finish if started now

## Context

Routine rows in the library ([SPEC-011], Control Center [SPEC-012]) show task
count and total estimated minutes — a duration, not a wall-clock time. The
product's core promise is converting durations into arrival times ([SPEC-001],
[SPEC-005]). User request (2026-07-11): show, for each routine, the time it would
finish if started at that moment (now + sum of estimates), so choosing a routine
carries the same "when will I be done" information the running list has.

## Design

- **Placement: both the collapsed row and the expanded preview (TK-009)** —
  decided with the user, 2026-07-11. On the row it gives an immediate sense of
  when each routine would end without expanding it; repeating it in the expanded
  view preserves interface consistency.
- **Presentation: the map-pin + the time, tooltip on tap** — decided with the
  user, 2026-07-11. The pin already means "estimated arrival time" across the app
  (arrival header holding state [SPEC-006], per-task times on cards [SPEC-010]),
  so the routine forecast reuses it rather than inventing a symbol: `MapPin` +
  wall-clock time on the row and in the expanded preview, with the TK-029 tooltip
  pattern naming it on demand. Tooltip copy extends the established neutral
  wording: **"Estimated arrival time if started now"**.
- **Considered and rejected: swapping the pin for a flag app-wide.** A flag reads
  as finish line/goal — closer to a deadline than an arrival, against the app's
  calm tone — while the pin belongs to the GPS metaphor the copy already uses
  ("estimated arrival time"), has a learned vocabulary with variants
  (`MapPinCheckInside` for arrived/done), and a structural swap would touch
  SPEC-006/SPEC-010 surfaces for no clarity gain.
- **Tooltip placement detail** (surfaced during planning): the row's metadata
  line lives inside the expand-toggle `<button>`, and `IconTooltip` is itself a
  button — nesting is invalid HTML. Resolution: on the row the pin + time is
  informative (with screen-reader-only text carrying the meaning); the
  interactive TK-029 tooltip lives in the expanded preview, where nesting is
  legal. Tapping the row keeps its single meaning: expand.
- The forecast is `now + sum of estimates`, formatted like task ETAs (24h
  HH:MM), recomputed from the shared per-second clock so it never goes stale
  while the drawer is open.

## Plan

(Design settled; not started — held until TK-031 is accepted, one ticket at a
time.)

- [ ] Red: `RoutineItem` forecast tests — row shows pin + now+total time with
      sr-only meaning; expanded preview shows the IconTooltip'd forecast with
      the agreed label; the display advances when the clock does.
- [ ] Green: wire `useClock` into `RoutineItem`, render both placements.
- [ ] Full suite + lint + format.
- [ ] Update SPEC-011 and SPEC-012.
- [ ] Self-check on the running app; move to `in-review`.

## Acceptance criteria

- [ ] Each routine displays the wall-clock time it would finish if started at that
      moment.
- [ ] The displayed time stays current while visible (it advances with the clock).
- [ ] The label makes clear it is a projection of starting now, phrased calmly and
      unambiguously.
- [ ] SPEC-011 (and SPEC-012 if the layout changes) are updated.
