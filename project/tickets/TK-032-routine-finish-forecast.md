---
id: TK-032
title: Show the time a routine would finish if started now
type: feature
status: done
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
- **Tooltip fit on narrow screens** (surfaced in review, 2026-07-15): the bubble
  is centred on its trigger, which sits against the right edge of a card that
  clips (`overflow-hidden` is load-bearing there — it keeps the swipe reveal
  rounded for TK-031 and drives TK-009's grid-rows expand animation). With the
  longest label in the app, 35% of it was cut off at every phone width, with no
  scroll to reach the rest. Decided with the user: `IconTooltip` gains an
  optional `align="end"` that anchors the bubble to the trigger's right edge and
  wraps it within a set width. The default stays centred, so [SPEC-006]'s arrival
  header is untouched. Rejected: shortening the agreed copy, and moving the
  forecast to the left (still tight at 320px).

## Plan

(Design settled; TK-031 accepted, so the hold is lifted.)

- [x] Red: `RoutineItem` forecast tests (`RoutineItem.forecast.test.tsx`) — row
      shows pin + now+total time with sr-only meaning; expanded preview shows the
      IconTooltip'd forecast with the agreed label; the display advances when the
      clock does.
- [x] Green: wire `useClock` into `RoutineItem`, render both placements (module
      `timeFormatter` reused from the task-ETA form).
- [x] Full suite + lint + format (310 tests green; the lone App.test.tsx worker
      timeout is the known PRoot flake — re-ran it alone, 3/3 pass).
- [x] Update SPEC-011 and SPEC-012.
- [x] Self-check on the running app; move to `in-review`. 7/7 end-to-end checks
      passed (collapsed row shows pin + now+40m time with sr-only meaning; the
      expanded preview repeats it as the interactive IconTooltip carrying the
      "Estimated arrival time if started now" description; the row time equals a
      freshly computed now+total). Live ticking wasn't watched for a full minute
      on the app — covered by the unit test's fake-clock advance.

### Review round 1 (2026-07-15)

- [x] Reviewed end-to-end on the running app, 12/12 checks. Closes the gap left
      above: the live minute rollover was watched on the real clock (row and
      preview both advanced to the recomputed now+total). Also confirmed each
      routine forecasts its own total, not a shared one.
- [x] Red/Green: `IconTooltip` `align="end"` — bubble anchors right and wraps
      within a set width; default stays centred (`ArrivalDisplay` unchanged).
- [x] Green: `RoutineItem`'s preview forecast passes `align="end"`.
- [x] Full suite + lint + format (316 tests green; no App.test.tsx flake this
      run).
- [x] Re-measured in the browser at 320/360/390/414: bubble 208px, 2 lines,
      16px clearance from the clipping edge and 24px below — was 286px with
      100px cut off. Arrival header byte-identical (178px, centred).

- [x] Accepted by the user on the running app (2026-07-15).

## Acceptance criteria

- [x] Each routine displays the wall-clock time it would finish if started at that
      moment.
- [x] The displayed time stays current while visible (it advances with the clock).
- [x] The label makes clear it is a projection of starting now, phrased calmly and
      unambiguously.
- [x] SPEC-011 (and SPEC-012 if the layout changes) are updated.
