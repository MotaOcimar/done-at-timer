---
id: TK-009
title: Expand routine in the library to preview its tasks
type: feature
status: open
specs: [SPEC-011, SPEC-012]
---

# Expand routine in the library to preview its tasks

## Context
The routine library ([SPEC-011], surfaced in the Control Center [SPEC-012]) lists
routines by name only — the user must load one to see what's inside. Clicking a
routine should expand it in place to preview its task list, with load/delete
actions. Migrated from `conductor/backlog.md` (TK-001).

## Acceptance criteria
- [ ] Clicking a routine in the library expands it to show its tasks (names and
      durations) without loading it.
- [ ] The expanded view offers load and delete actions.
- [ ] SPEC-011 (and SPEC-012 if the Control Center layout changes) are updated.
