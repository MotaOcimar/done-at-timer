---
id: TK-013
title: Toggle for auto-advance vs manual completion confirmation
type: feature
status: open
specs: [SPEC-004, SPEC-012]
---

# Toggle for auto-advance vs manual completion confirmation

## Context

When a task's time is up, the app always waits for manual confirmation before
completing and advancing ([SPEC-004]). Some users prefer auto-advance (timer ends →
next task starts). A setting in the Control Center ([SPEC-012]) should let the user
choose. This was the surviving sub-item of the completed "Completion Checkpoint"
backlog entry. Migrated from `conductor/backlog.md` (TK-001).

## Acceptance criteria

- [ ] A setting toggles between manual confirmation (current behavior, default) and
      auto-advance when a task's time is up.
- [ ] With auto-advance on, the finished task completes and the next to-do task
      starts without user input; overtime never accrues.
- [ ] The choice persists across sessions ([SPEC-013]).
- [ ] SPEC-004 and SPEC-012 are updated.
