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
- **Load** replaces the current list with the routine's tasks, all starting as
  "to do". If the current list is not empty, the user must confirm the replacement
  (it is irreversible).
- **Delete** removes a saved routine, after confirmation.
- Routines are managed in the Control Center ([SPEC-012]), which lists each with its
  task count and total estimated minutes. They persist on the device ([SPEC-013]).

## Known limitations
- No edit-in-place: "load → tweak → save" duplicates instead of updating, which
  surprises users. An update/"save as" flow is TK-017.
- Routines exist on one device only; one-shot sharing via URL is TK-021 (chosen by
  the TK-003 research; live sync was ruled out).

## Implementation pointers
- `src/store/useTaskStore.ts`, `src/components/ControlCenter.tsx`

## Log
- Seeded from code + conductor archive (2026-07-02)
- TK-001: pointed the edit-in-place limitation at TK-017 (2026-07-02)
- TK-003: sharing research concluded — URL sharing planned as TK-021 (2026-07-03)
