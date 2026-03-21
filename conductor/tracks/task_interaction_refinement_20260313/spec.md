# Specification: Task Interaction Refinement & Cleanup

## Overview
This track aims to refine task interactions and clean up the UI by removing redundant elements and introducing a swipe-to-delete pattern.

## Functional Requirements
- **Whole Card Dragging**: Tasks can be reordered by dragging from any part of the task card. Interactive elements within the card (inline edit inputs, Play/Pause/Done buttons) must remain functional and **not** initiate drag.
- **Remove Drag Handles & Spacers**: The existing `GripHorizontal` drag handle icons on the left side of task cards are removed, along with the empty spacer `div` that renders in their place for active/completed tasks, reclaiming horizontal space.
- **Swipe-to-Delete**:
    - **Scope**: Available on all tasks **except completed** tasks. This includes pending, paused, and active tasks. Completed tasks are intentionally excluded — they represent history of what was done and should not be individually removable. Batch clearing (Reset/Clear) remains available for starting fresh.
    - Swiping a task card from right to left reveals a "Delete" action area "behind" the card.
    - This revealed state ("Reveal & Stay") persists until the user either clicks "Delete" or swipes back to dismiss.
    - On active tasks, the swipe-to-delete coexists with the "Done" button — swipe reveals Delete behind the card while Done remains visible on the card surface.
- **Delete Confirmation**: The "Delete" button is revealed behind the card, and clicking it confirms the deletion.
- **Remove Inline Delete Button**: The current delete button (Trash2 icon) on the task card is removed.

## Gesture Conflict Resolution (DnD vs. Swipe)
Three interaction layers share the card surface: interactive elements (inputs, buttons), swipe-to-delete, and drag-to-reorder. Resolution order:

1. **Interactive elements take priority**: Pointer events on `InlineEdit` inputs, Play/Pause/Done buttons, and other interactive elements are handled normally and must **not** initiate drag or swipe. This is achieved by not propagating dnd-kit `listeners` to these elements (listeners go on the card container, not the interactive children).
2. **Swipe-to-delete (no time threshold)**: Any immediate right-to-left horizontal drag on the card surface (outside interactive elements) is interpreted as a swipe-to-delete. Since it only reveals a confirmation button (no destructive action on the gesture alone), it is safe to trigger without delay. The swipe layer (`framer-motion` drag) sits above the dnd-kit sortable layer and intercepts right-to-left gestures via `stopPropagation` before dnd-kit sensors activate.
3. **Drag-to-reorder (time threshold / hold delay)**: The user must hold the card for a brief delay before drag-to-reorder activates. Once the hold delay is satisfied, dragging in any direction **except** right-to-left initiates reordering.
4. **Priority rule**: Right-to-left always means swipe-to-delete, regardless of hold state. All other directions after hold delay mean reorder.

## Non-Functional Requirements
- **Performance**: Swipe interactions should be smooth and responsive.
- **Accessibility**: Swipe-to-delete must have a keyboard fallback (e.g. `Delete` key or context menu) so the feature is usable without touch/mouse gestures.

## Acceptance Criteria
- [ ] Task cards no longer have the `GripHorizontal` drag handle or the empty spacer div.
- [ ] Dragging from anywhere on a task card (outside interactive elements) initiates reordering (after hold delay).
- [ ] Interactive elements (inline edit inputs, Play/Pause/Done buttons) remain functional and do not trigger drag or swipe.
- [ ] Swiping a pending, paused, or active task from right to left (no delay needed) reveals a "Delete" button behind the card.
- [ ] Completed tasks do not support swipe-to-delete.
- [ ] Clicking the revealed "Delete" button removes the task.
- [ ] Swiping back (left to right) hides the "Delete" button.
- [ ] The existing inline delete button (Trash2) within the task card is gone.
- [ ] Keyboard users can trigger delete via `Delete` key or equivalent fallback.
- [ ] Right-to-left gesture always triggers swipe-to-delete, never reorder.

## Out of Scope
- Changing the overall app layout (only task card-level interaction refinements).
- Adding multi-select for deletion.
