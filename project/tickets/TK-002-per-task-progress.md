---
id: TK-002
title: Remember partial progress per task
type: feature
status: open
specs: [SPEC-003, SPEC-010]
---

# Remember partial progress per task

## Context

Today only the running task's partial progress is tracked, globally; switching the
active task or demoting it to "to do" silently discards progress (documented as a
known limitation in SPEC-003). Users who alternate between tasks lose real work
time from the projection.

## Acceptance criteria

- [ ] A task that ran for N minutes and was switched away from resumes later with N
      minutes elapsed, not from zero.
- [ ] Arrival projections ([SPEC-005]) account for a to-do task's already-elapsed
      time.
- [ ] The user can explicitly reset a task's partial progress from its card
      ([SPEC-010]).
- [ ] SPEC-003 known-limitation removed; SPEC-003 and SPEC-010 updated to the new
      behavior.

## Notes

Origin: conductor backlog "Per-task Progress Persistence" (Technical Debt).
