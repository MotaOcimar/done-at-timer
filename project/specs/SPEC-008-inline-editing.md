---
id: SPEC-008
title: Inline editing of tasks
status: implemented
links: [SPEC-002, SPEC-003]
---

# Inline editing

- The user edits a task's **title** or **duration** by clicking directly on it in
  the list — no separate edit screen or modal.
- Edits apply in place, without disturbing the task's position or state.
- Editing the duration of the **running** task preserves progress already made; only
  the due moment shifts ([SPEC-003]).

## Implementation pointers
- `src/components/InlineEdit.tsx`, `src/components/TaskCard.tsx`

## Log
- Seeded from code + conductor archive (2026-07-02)
