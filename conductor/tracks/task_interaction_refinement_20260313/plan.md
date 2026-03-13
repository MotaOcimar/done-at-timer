# Implementation Plan: Task Interaction Refinement & Cleanup

## Phase 1: Reordering & Cleanup
Focus on removing the drag handles and allowing dragging from anywhere on the task card.

- [ ] Task: Remove drag handle icons from `TaskCard.tsx`
    - [ ] Identify and remove Lucide "2 lines" (likely `GripVertical` or similar) icon.
    - [ ] Update CSS/Tailwind to reclaim space.
- [ ] Task: Enable whole-card dragging in `TaskCard.tsx` / `TaskList.tsx`
    - [ ] Ensure the drag listener is applied to the entire card container.
    - [ ] Update `dnd-kit` (or equivalent) configuration if necessary.
- [ ] Task: Update tests for task reordering
    - [ ] Update `TaskCard.test.tsx` to reflect the removal of the handle.
    - [ ] Ensure reordering tests still pass when dragging from the card body.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Reordering & Cleanup' (Protocol in workflow.md)

## Phase 2: Swipe-to-Delete Implementation
Introduce the swipe-to-delete gesture and the "Delete" button revealed behind the card.

- [ ] Task: Implement swipe gesture on `TaskCard.tsx`
    - [ ] Use a library like `framer-motion` or native touch events for swiping.
    - [ ] Implement "Reveal & Stay" logic for right-to-left swipe.
- [ ] Task: Create "Reveal Behind" area with Delete button
    - [ ] Add a hidden layer behind the task card containing a red "Delete" button.
    - [ ] Ensure the button is only clickable when revealed.
- [ ] Task: Remove existing inline delete button from `TaskCard.tsx`
    - [ ] Delete the button and its associated styles from the card's main UI.
- [ ] Task: Connect revealed Delete button to task deletion logic
    - [ ] Ensure clicking the new Delete button triggers `deleteTask` in `useTaskStore`.
- [ ] Task: Add tests for swipe-to-delete
    - [ ] Create/Update tests to verify swipe reveal.
    - [ ] Verify that the revealed Delete button correctly removes the task.
    - [ ] Verify that the inline delete button is gone.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Swipe-to-Delete Implementation' (Protocol in workflow.md)

## Phase 3: Final Polish & Mobile Verification
Ensure the interactions feel "native" and work perfectly on mobile.

- [ ] Task: Refine swipe animations and haptics (if applicable)
    - [ ] Ensure the swipe feels smooth and has appropriate resistance/snapping.
- [ ] Task: Verify mobile responsiveness and touch targets
    - [ ] Check that the revealed Delete button is easy to tap on mobile (min 44x44px).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Polish & Mobile Verification' (Protocol in workflow.md)