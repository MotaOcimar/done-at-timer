---
id: TK-035
title: Save a departure time on a routine (example forecast)
type: feature
status: open
specs: [SPEC-011, SPEC-012, SPEC-013]
---

# Save a departure time on a routine (example forecast)

## Context

The routine finish forecast (TK-032, [SPEC-011]) always assumes departure
*now*, and TK-034 makes that departure explicit on the row (`◉ now ┄┄ ⌖
arrival`). User request (2026-07-15, refined during ticket design): let the
user attach a **departure time to the routine itself**, saved with it, so the
row shows a stored example forecast — "Ex.: ◉ 07:00 ┄┄ ⌖ 07:40". This answers
"if I leave at my usual time, when do I arrive?" and fits routines that repeat
at the same hour (morning routine, lunch routine, night routine).

Depends on TK-034 (the departure endpoint and route visual must exist first).

## Acceptance criteria

- [ ] Tapping the departure time (◉) of a routine lets the user pick a time of
      day via the platform's native time picker.
- [ ] The chosen time is saved with the routine and survives reloads.
- [ ] A routine with a saved departure shows the example pair (departure +
      departure-plus-estimates arrival) in place of the live "leaving now"
      forecast — on the row and in the expanded preview — clearly marked as an
      example, calmly phrased.
- [ ] A routine without a saved departure keeps the live "leaving now"
      forecast (TK-034 behavior).
- [ ] The saved departure can be cleared, returning the routine to the live
      forecast.
- [ ] Share links carry the saved departure; the import preview shows it;
      links without one (and pre-existing links) still import cleanly.
- [ ] The forecast is purely informational — it does not schedule, start, or
      modify anything else about the routine.
- [ ] Affected specs are updated.

## Design

(decided with the user, 2026-07-15)

- **The departure time is a routine attribute, not a throwaway simulation** —
  decided with the user, who reframed the original "temporary what-if" idea:
  routines recur at characteristic hours, so the time is worth keeping. It is
  a time of day (HH:MM), not a date — "07:00" means "my usual 07:00", so
  there is no past/tomorrow ambiguity to resolve.
- **The saved example replaces the live forecast everywhere** (row and
  expanded preview). One pair per routine keeps the dense rows readable;
  rejected: showing example + live side by side (two time pairs in a 320px
  row), and keeping live only in the preview.
- **Editing uses the native time picker** (`input type="time"` semantics):
  accessible and familiar for free, consistent with the app's inline-editing
  spirit ([SPEC-008]). Rejected: relative quick-adjust chips (can't reach
  arbitrary times).
- **Saving the time mutates the stored routine in place.** This is the first
  in-place routine edit ([SPEC-011] says save always creates new; edit-in-place
  is TK-017) — deliberately scoped to this one metadata field; task/title
  edit-in-place remains TK-017's problem.
- **Share links carry the field** ([SPEC-011]): it is part of the routine like
  its name and tasks, shown in the import preview. The link format gains an
  optional field; links without it remain valid both ways.
- **Presentation of "example"**: the pair is prefixed so it never reads as a
  live promise (direction: "e.g." — final English copy polished at
  implementation, calm tone; no alarm if the hour has already passed today).
- **A saved example is always numeric — never the word "now".** TK-034
  reserves "now" for a departure that tracks the advancing clock; that is the
  cue that tells live and fixed apart at a glance. Even when a saved time
  coincides with the current minute it stays numeric — borrowing "now" there
  would break the very distinction the word exists to carry (and it would
  flip back a minute later).
- **Out of scope:** applying a simulated departure to the running list or the
  arrival header; multiple saved times per routine; any scheduling or
  notification tied to the saved hour.

## Plan

(to be written when work starts)
