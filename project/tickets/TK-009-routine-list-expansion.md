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
routine should expand it in place to preview its task list. Migrated from
`conductor/backlog.md` (TK-001).

Refined with the user (2026-07-11): the preview expands **inline in the list**, not
in a modal. Today tapping a routine loads it directly (after confirmation); this
ticket intentionally changes that — tap expands, and loading happens from inside
the expanded view. The chevron icon each routine already shows becomes the
expansion affordance: it rotates when the routine expands/collapses. Delete moved
out of scope — routine deletion becomes a swipe gesture in TK-031.

## Acceptance criteria

- [ ] Tapping a routine (or its chevron) expands it in place, showing its tasks
      (names and durations) without loading it; tapping again collapses it.
- [ ] The chevron rotates to reflect the expanded/collapsed state.
- [ ] The expanded view offers the load action; the existing confirmation when the
      current list is non-empty is preserved.
- [ ] No modal is involved in previewing.
- [ ] SPEC-011 (and SPEC-012 if the Control Center layout changes) are updated.
