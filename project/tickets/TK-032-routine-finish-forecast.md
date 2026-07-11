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

Open dilemmas for planning: where the forecast lives (collapsed row, expanded
preview from TK-009, or both), and its exact copy — it must read as a projection,
in the app's calm tone, never as a deadline.

## Acceptance criteria

- [ ] Each routine displays the wall-clock time it would finish if started at that
      moment.
- [ ] The displayed time stays current while visible (it advances with the clock).
- [ ] The label makes clear it is a projection of starting now, phrased calmly and
      unambiguously.
- [ ] SPEC-011 (and SPEC-012 if the layout changes) are updated.
