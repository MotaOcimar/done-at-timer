---
id: TK-005
title: Arrival status icons (locked vs drifting)
type: feature
status: open
specs: [SPEC-006]
---

# Arrival status icons (locked vs drifting)

## Context
The arrival header ([SPEC-006]) signals a drifting arrival time with the text
"Arrival time is drifting". Text is easy to tune out; an icon next to the clock
would communicate the state at a glance. Migrated from `conductor/backlog.md`
(TK-001).

## Acceptance criteria
- [ ] When the timer is running, a static map/GPS-pin icon appears next to the
      arrival clock, signaling the arrival time is "locked" to current progress.
- [ ] When the timer is paused or in overtime, an animated/rotating clock icon
      appears instead, signaling the arrival time is drifting forward in real time.
- [ ] The icons replace or augment the current "drifting" text (decide in Design).
- [ ] SPEC-006 is updated to describe the new state signaling.
