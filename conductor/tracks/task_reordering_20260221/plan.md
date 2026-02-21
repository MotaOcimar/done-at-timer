# Implementation Plan: Task Reordering (Drag and Drop)

This plan outlines the steps to integrate `dnd-kit` for task reordering, following the TDD methodology defined in the project workflow.

## Phase 1: Store & Core Logic
- [ ] Task: Install `dnd-kit` dependencies
- [ ] Task: Extend `useTaskStore` with reordering logic
    - [ ] Red: Write test for `reorderTasks(activeId, overId)` action in `useTaskStore.test.ts`.
    - [ ] Green: Implement the `reorderTasks` action using `arrayMove` from `dnd-kit`.
- [ ] Task: Conductor - User Manual Verification 'Store & Core Logic' (Protocol in workflow.md)

## Phase 2: UI Integration (TaskList & TaskItem)
- [ ] Task: Integrate `DndContext` and `SortableContext` into `TaskList`
    - [ ] Red: Write test for `TaskList` to ensure it renders with a sortable wrapper.
    - [ ] Green: Wrap the list in `DndContext` and `SortableContext`.
- [ ] Task: Make `TaskItem` sortable
    - [ ] Red: Write test in `TaskItem.test.tsx` to verify it uses the `useSortable` hook (checking for attributes/listeners).
    - [ ] Green: Implement `useSortable` in `TaskItem` and apply styles for transformation and opacity.
- [ ] Task: Handle the `onDragEnd` event in `TaskList`
    - [ ] Red: Write integration test verifying that dragging an item triggers the store update.
    - [ ] Green: Implement the `handleDragEnd` function in `TaskList`.
- [ ] Task: Conductor - User Manual Verification 'UI Integration' (Protocol in workflow.md)

## Phase 3: UX Refinement & Polish
- [ ] Task: Add Drag Handle and Visual Styles
    - [ ] Red: Write test to ensure the drag handle is present and interactive.
    - [ ] Green: Style the dragging state (active item) and add a specific drag handle icon if needed.
- [ ] Task: Verify persistence and timer stability
    - [ ] Red: Test that reordering during an active timer does not reset the state.
    - [ ] Green: Ensure the store updates are reflected in Local Storage and the `Arrival Clock` remains accurate.
- [ ] Task: Conductor - User Manual Verification 'UX Refinement & Polish' (Protocol in workflow.md)