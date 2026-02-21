# Implementation Plan: Task Reordering (Drag and Drop)

This plan outlines the steps to integrate `dnd-kit` for task reordering, following the TDD methodology defined in the project workflow.

## Phase 1: Store & Core Logic [checkpoint: 531b9b3]
- [x] Task: Install `dnd-kit` dependencies 67a2e6f
- [x] Task: Extend `useTaskStore` with reordering logic 6e63456
    - [x] Red: Write test for `reorderTasks(activeId, overId)` action in `useTaskStore.test.ts`.
    - [x] Green: Implement the `reorderTasks` action using `arrayMove` from `dnd-kit`.
- [x] Task: Conductor - User Manual Verification 'Store & Core Logic' (Protocol in workflow.md) 531b9b3

## Phase 2: UI Integration (TaskList & TaskItem)
- [x] Task: Integrate `DndContext` and `SortableContext` into `TaskList` d0bbeab
    - [x] Red: Write test for `TaskList` to ensure it renders with a sortable wrapper.
    - [x] Green: Wrap the list in `DndContext` and `SortableContext`.
- [x] Task: Make `TaskItem` sortable af3bb0e
    - [x] Red: Write test in `TaskItem.test.tsx` to verify it uses the `useSortable` hook (checking for attributes/listeners).
    - [x] Green: Implement `useSortable` in `TaskItem` and apply styles for transformation and opacity.
- [x] Task: Handle the `onDragEnd` event in `TaskList` 0029e1d
    - [x] Red: Write integration test verifying that dragging an item triggers the store update.
    - [x] Green: Implement the `handleDragEnd` function in `TaskList`.
- [x] Task: Conductor - User Manual Verification 'UI Integration' (Protocol in workflow.md) 7355e33

## Phase 3: UX Refinement & Polish [checkpoint: 6d42572]
- [x] Task: Add Drag Handle and Visual Styles fe1c64c
    - [x] Red: Write test to ensure the drag handle is present and interactive.
    - [x] Green: Style the dragging state (active item) and add a specific drag handle icon if needed.
- [x] Task: SOLID Refactoring - Extract TaskCard from TaskItem a71cf48
    - [x] Red: Create `TaskCard.test.tsx` to define visual states independently.
    - [x] Green: Extract visual logic to `TaskCard.tsx` and refactor `TaskItem.tsx` to use it.
    - [x] Green: Update `DragOverlay` in `TaskList.tsx` to use the pure `TaskCard`.
- [x] Task: Verify persistence and timer stability 6d42572
    - [x] Red: Test that reordering during an active timer does not reset the state.
    - [x] Green: Ensure the store updates are reflected in Local Storage and the `Arrival Clock` remains accurate.
- [x] Task: Conductor - User Manual Verification 'UX Refinement & Polish' (Protocol in workflow.md) 6d42572