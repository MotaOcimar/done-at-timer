---
id: TK-017
title: Routine edit-in-place (save updates the loaded routine)
type: idea
status: open
specs: [SPEC-011]
---

# Routine edit-in-place (save updates the loaded routine)

## Context
Loading a routine, editing it, and saving creates a *new* routine instead of
updating the original ([SPEC-011] documents this as a known limitation). Users
expect load → edit → save to update the same routine. The app would keep a link to
the loaded routine's identity so saving updates it in place. Migrated from
`conductor/backlog.md` (TK-001).

## Notes
Idea stage — must graduate before any work. Open design questions from the
original backlog discussion:

- **Auto-save vs explicit save**: persist edits automatically (Google-Docs-like) or
  require an explicit Save? Auto is lower friction, riskier when experimenting.
- **Creating from scratch**: if the app is "always editing a routine", how does a
  fresh unlinked list start? Needs a clear "New/Clear" flow.
- **Save As / forking**: load "Morning Routine", tweak, save as "Weekend Morning"
  without touching the original — needs both "Save" and "Save As New".
- **Visual indicator**: always show whether the current list is a saved routine
  (and which) or an unsaved draft.
- **Dirty state**: confirm before discarding unsaved changes when loading another
  routine or clearing.
