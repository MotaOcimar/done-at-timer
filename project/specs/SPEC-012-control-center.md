---
id: SPEC-012
title: Control Center (unified sidebar)
status: implemented
links: [SPEC-011, SPEC-014, SPEC-015]
---

# Control Center

All secondary features live in a single drawer that slides in from the right,
opened by the menu button in the sticky header — keeping the main screen focused on
tasks and the arrival time.

Sections:

1. **Saved Libraries** — the routine list: each row shows the routine's name, its
   task count and total minutes, and the wall-clock time it would finish if
   started now ([SPEC-011]); tap expands an inline preview of the routine's tasks
   with the load action and the same finish forecast; share sits on the row, and
   delete is revealed by the swipe gesture ([SPEC-011], [SPEC-009]).
2. **Preferences** — notification permission and toggle ([SPEC-014]); the section is
   hidden entirely on browsers without notification support.
3. **App** — installation status and install action ([SPEC-015]).

Loading over a non-empty list asks for confirmation in a modal ([SPEC-011]).
Routine deletion is confirmed by its own deliberate two-step gesture
([SPEC-009]) rather than a dialog.

## Implementation pointers

- `src/components/ControlCenter.tsx`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-009: Saved Libraries rows now expand in place to preview tasks; loading
  moved inside the preview (2026-07-11)
- TK-031: routine delete became swipe-revealed and dialog-free; the row's
  visible delete button and its confirmation modal were removed (2026-07-11)
- TK-032: each Saved Libraries row (and its expanded preview) now shows the
  routine's now+total finish time (2026-07-11)
