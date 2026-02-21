# Implementation Plan - Inline Editing

## Phase 1: Store Logic Updates [checkpoint: 90bab79]
- [x] Task: Create tests for task editing logic in `src/store/useTaskStore.edit.test.ts` 3c29aad
    - Verify `updateTask` correctly updates pending tasks.
    - Verify `updateTask` correctly adjusts `targetEndTime` when active task duration changes.
- [x] Task: Implement `updateTask` logic in `src/store/useTaskStore.ts` 3c29aad
    - Add logic to recalculate `targetEndTime` if the active task's duration is modified.
- [x] Task: Conductor - User Manual Verification 'Store Logic Updates' (Protocol in workflow.md) 90bab79

## Phase 2: UI Implementation [checkpoint: c9008d9]
- [x] Task: Create `InlineEdit` component logic in `src/components/TaskItem.tsx` 0d5afe0
    - Implement toggle state (view/edit).
    - Handle `autoFocus`, `onBlur` (save), `onKeyDown` (Enter=save, Escape=cancel).
- [x] Task: Integrate Inline Editing into `TaskItem` 0d5afe0
    - Replace Task Name and Duration text with the editable component.
    - Connect to `updateTask` store action.
- [x] Task: Update `src/components/TaskItem.test.tsx` 0d5afe0
    - Add tests for entering edit mode, saving changes, and cancelling.
- [x] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md) c9008d9

## Phase: Review Fixes
- [x] Task: Apply review suggestions c65ff39
