---
id: SPEC-011
title: Routines (saved task lists)
status: implemented
links: [SPEC-002, SPEC-012, SPEC-013]
---

# Routines

A routine is a **named snapshot of a task list** — titles and estimates only. No
progress, no completion records: a routine is a template, not a session.

- **Save** captures the current list under a name chosen by the user. Saving
  requires a non-empty list. Saving **always creates a new routine**, even if the
  list was loaded from an existing one.
- **Preview**: tapping a routine in the library expands it in place — no modal —
  listing its tasks in order with their estimates, without loading anything. At
  most one routine is expanded at a time; the chevron on the row rotates to
  signal the expanded state, and tapping again collapses it. The load action
  lives inside the expanded preview.
- **Load** replaces the current list with the routine's tasks, all starting as
  "to do". If the current list is not empty, the user must confirm the replacement
  (it is irreversible).
- **Delete** removes a saved routine, after confirmation.
- **Share** produces a link that carries the routine itself (name, tasks,
  estimates) — no account, no server ([SPEC-001]). The user can hand the link to
  the system share sheet or copy it (with visual feedback when copied).
- **Import**: opening a share link in the app — any browser, any device — shows a
  preview of the incoming routine (name, tasks with estimates, total) and asks for
  confirmation. Importing adds it as a **new** routine, never replacing an
  existing one (duplicate names are allowed, same as saving); declining leaves the
  device untouched. Either way, reloading afterwards does not re-prompt.
- A corrupted or truncated share link produces a clear error and nothing else
  changes; a link created by a newer app version is told apart and reported as
  such.
- Routines are managed in the Control Center ([SPEC-012]), which lists each with its
  task count and total estimated minutes. They persist on the device ([SPEC-013]).

## Known limitations

- No edit-in-place: "load → tweak → save" duplicates instead of updating, which
  surprises users. An update/"save as" flow is TK-017.
- No live sync between devices: a share link is a one-shot copy; edits made after
  sharing do not propagate (ruled out by the TK-003 research).

## Implementation pointers

- `src/store/useTaskStore.ts`, `src/components/ControlCenter.tsx`
- Sharing: `src/utils/routineShare.ts`, `src/utils/shareService.ts`,
  `src/utils/urlFragment.ts`, `src/components/RoutineImport.tsx`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-001: pointed the edit-in-place limitation at TK-017 (2026-07-02)
- TK-003: sharing research concluded — URL sharing planned as TK-021 (2026-07-03)
- TK-021: routines can be shared and imported via URL (2026-07-03)
- TK-009: tapping a routine now expands an inline preview of its tasks with the
  load action, instead of loading directly (2026-07-11)
