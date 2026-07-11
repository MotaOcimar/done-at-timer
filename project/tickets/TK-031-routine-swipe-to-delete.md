---
id: TK-031
title: Delete routines via swipe, like tasks
type: feature
status: open
specs: [SPEC-009, SPEC-011, SPEC-012]
---

# Delete routines via swipe, like tasks

## Context

Tasks are deleted by swiping the card right-to-left to reveal a delete button
([SPEC-009]); routines in the library ([SPEC-011], Control Center [SPEC-012]) are
deleted through an always-visible delete button on each row. User request
(2026-07-11): make routine deletion the same swipe gesture — it frees space on the
row and keeps the interaction consistent with the rest of the app.

Open dilemma for planning: whether the confirmation dialog routine deletion has
today survives the move to swipe (task swipe-delete has none), or the deliberate
gesture is treated as the confirmation.

## Acceptance criteria

- [ ] Swiping a routine row right-to-left reveals a delete button, with the same
      gesture semantics as tasks (commit threshold, quick flick, at most one row
      revealed at a time, haptic pulse where supported).
- [ ] The always-visible delete button is removed from the routine row.
- [ ] Deletion is not gesture-only — a keyboard/accessible fallback exists, as with
      tasks.
- [ ] SPEC-011 (and SPEC-009 or SPEC-012 as appropriate) updated to cover how
      routines are deleted.
