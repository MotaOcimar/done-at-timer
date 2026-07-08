---
id: SPEC-008
title: Inline editing of tasks
status: implemented
links: [SPEC-002, SPEC-003]
---

# Inline editing

- The user edits a task's **title** or **duration** by clicking directly on it in
  the list — no separate edit screen or modal.
- **Save / cancel:** confirming (Enter) or clicking away saves; Escape cancels and
  restores the original value.
- **Invalid input never lands:** an emptied title reverts to the original; a
  duration must be a positive whole number of minutes — anything else reverts.
- Edits apply in place, without disturbing the task's position or state.
- Editing the duration of the **running** task preserves progress already made; only
  the due moment shifts ([SPEC-003]).

## Implementation pointers

- `src/components/InlineEdit.tsx`, `src/components/TaskCard.tsx`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-004: added save/cancel and validation rules from the inline_editing track,
  verified in code (2026-07-02)
