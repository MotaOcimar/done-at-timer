---
id: SPEC-007
title: Task reordering (drag & drop)
status: implemented
links: [SPEC-002, SPEC-009]
---

# Task reordering

- The user can reorder tasks by dragging — planning the routine by rearranging the
  future.
- **The whole card is the drag surface** — there is no dedicated handle. Interactive
  elements on the card (editable texts, buttons) never start a drag, and a
  right-to-left gesture is reserved for swipe-to-delete ([SPEC-009]).
- **Only to-do tasks can be reordered**, and only within the to-do section: a drop
  above the done/running block lands at the top of the to-do section instead. The
  past → present → future reading of the list ([SPEC-002]) is never violated.
- Works with mouse (drag starts only after a small movement, so clicks still work),
  touch (press-and-hold before the drag starts, so scrolling still works), and
  keyboard.
- Reordering while a timer runs never disturbs the running task or its countdown.

## Implementation pointers

- `src/components/TaskList.tsx`, `src/components/TaskItem.tsx`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-004: removed stale known-limitation — the drag handle was already gone and
  whole-card dragging implemented (conductor track task_interaction_refinement,
  2026-03-13); added the reorder-during-timer guarantee (2026-07-02)
