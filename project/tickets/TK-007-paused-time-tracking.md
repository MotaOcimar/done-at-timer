---
id: TK-007
title: Track paused time and show it in the progress bar
type: feature
status: open
specs: [SPEC-003, SPEC-010]
---

# Track paused time and show it in the progress bar

## Context

Pausing freezes progress ([SPEC-003]) but the time spent paused is invisible — the
user can't see how much "drift" a pause added to their arrival time. Measuring
paused time and rendering it as a distinct color segment in the task's progress bar
([SPEC-010]) would make the drift tangible. Migrated from `conductor/backlog.md`
(TK-001).

## Acceptance criteria

- [ ] Time spent paused on a task is measured.
- [ ] The task's progress bar shows paused time as a visually distinct segment,
      separate from worked time.
- [ ] SPEC-003 and SPEC-010 are updated accordingly.

## Notes

Likely interacts with TK-002 (per-task progress persistence) — if elapsed time
moves into the task model, paused time probably belongs there too.
