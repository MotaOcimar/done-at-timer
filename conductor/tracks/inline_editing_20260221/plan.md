# Implementation Plan - Inline Editing

## Phase 1: Store Logic Updates [checkpoint: 90bab79]
- [x] Task: Create tests for task editing logic in `src/store/useTaskStore.edit.test.ts` 3c29aad
    - Verify `updateTask` correctly updates pending tasks.
    - Verify `updateTask` correctly adjusts `targetEndTime` when active task duration changes.
- [x] Task: Implement `updateTask` logic in `src/store/useTaskStore.ts` 3c29aad
    - Add logic to recalculate `targetEndTime` if the active task's duration is modified.
- [x] Task: Conductor - User Manual Verification 'Store Logic Updates' (Protocol in workflow.md) 90bab79

## Phase 2: UI Implementation
- [ ] Task: Create `InlineEdit` component logic in `src/components/TaskItem.tsx`
    - Implement toggle state (view/edit).
    - Handle `autoFocus`, `onBlur` (save), `onKeyDown` (Enter=save, Escape=cancel).
- [ ] Task: Integrate Inline Editing into `TaskItem`
    - Replace Task Name and Duration text with the editable component.
    - Connect to `updateTask` store action.
- [ ] Task: Update `src/components/TaskItem.test.tsx`
    - Add tests for entering edit mode, saving changes, and cancelling.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)