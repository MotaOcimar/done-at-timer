# Specification: Task Reordering (Drag and Drop)

## 1. Overview
The goal of this track is to allow users to reorder tasks within their lists using a drag-and-drop interface. This improves flexibility, allowing users to prioritize or organize their routines without deleting and recreating tasks.

## 2. Functional Requirements
- **Drag and Drop Interface:** Users can grab a task and move it to a new position in the list.
- **Immediate Persistence:** The new order of tasks must be saved to Local Storage immediately after the drop action.
- **Active Timer Support:** Reordering should be possible even while a task timer is running.
- **Visual Feedback:** The UI should provide smooth, animated transitions during the drag operation to indicate where the task will land.
- **Arrival Clock Independence:** Changing the order of tasks does not affect the total duration or the "Arrival Clock" (ETA), as durations are cumulative.

## 3. Non-Functional Requirements
- **Performance:** Reordering should feel "snappy" and without lag, even with 10+ tasks.
- **Accessibility:** Ensure the reordering functionality is accessible via keyboard (standard in `dnd-kit`).
- **Tech Choice:** Implementation using `@dnd-kit/core` and `@dnd-kit/sortable`.

## 4. Acceptance Criteria
- [ ] User can click/touch a task (or a handle) and drag it.
- [ ] Tasks animate smoothly into their new positions as the dragged item moves.
- [ ] Dropping a task updates the order in the `useTaskStore`.
- [ ] Refreshing the page preserves the new order.
- [ ] Reordering while a timer is running does not stop or reset the timer.

## 5. Out of Scope
- Reordering tasks between different routines (not yet implemented in the app).
- Multi-task selection or bulk reordering.