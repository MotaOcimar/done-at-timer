---
id: SPEC-007
title: Task reordering (drag & drop)
status: implemented
links: [SPEC-002]
---

# Task reordering

- The user can reorder tasks by dragging — planning the routine by rearranging the
  future.
- **Only to-do tasks can be dragged**, and only within the to-do section: a drop
  above the done/running block lands at the top of the to-do section instead. The
  past → present → future reading of the list ([SPEC-002]) is never violated.
- Works with mouse (drag starts only after a small movement, so clicks still work),
  touch (press-and-hold before the drag starts, so scrolling still works), and
  keyboard.

## Known limitations
- Dragging works only from a dedicated handle, and the handle is shown only on to-do
  tasks — leaving inconsistent card layouts across states. The intended direction
  (backlog, not yet a ticket) is whole-card dragging with no handle.

## Implementation pointers
- `src/components/TaskList.tsx`, `src/components/TaskItem.tsx`

## Log
- Seeded from code + conductor archive (2026-07-02)
