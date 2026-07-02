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

1. **Saved Libraries** — the routine list: load (tap) and delete ([SPEC-011]).
2. **Preferences** — notification permission and toggle ([SPEC-014]); the section is
   hidden entirely on browsers without notification support.
3. **App** — installation status and install action ([SPEC-015]).

Destructive or replacing actions triggered from here (load over a non-empty list,
delete routine) always ask for confirmation in a modal.

## Implementation pointers
- `src/components/ControlCenter.tsx`

## Log
- Seeded from code + conductor archive (2026-07-02)
