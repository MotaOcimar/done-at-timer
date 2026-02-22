# Implementation Plan: Sticky Arrival Time

This plan details the steps to implement a sticky `ArrivalDisplay` component at the top of the screen.

## Phase 1: Layout & Style Refinement
Goal: Prepare the application layout to support a sticky header without layout shifts.

- [ ] Task: Create a new test file `src/integration.sticky.test.tsx` to verify sticky behavior (TDD Red Phase)
- [ ] Task: Update `App.tsx` or `Layout.tsx` to wrap `ArrivalDisplay` in a sticky container
- [ ] Task: Apply `sticky top-0 z-50` and ensure the background is solid/opaque (TDD Green Phase)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Layout & Style Refinement' (Protocol in workflow.md)

## Phase 2: Visual Separation & Polish
Goal: Ensure the sticky header looks good and provides clear visual feedback when content scrolls underneath.

- [ ] Task: Add a subtle shadow or bottom border to `ArrivalDisplay` that appears/enhances when sticky
- [ ] Task: Verify that `TaskList` items pass correctly behind the sticky header (z-index check)
- [ ] Task: Ensure `TaskInput` is still accessible and visible at the bottom of the viewport
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Visual Separation & Polish' (Protocol in workflow.md)

## Phase 3: Final Verification & Cleanup
Goal: Ensure the feature works perfectly across different screen sizes and states.

- [ ] Task: Verify sticky behavior on mobile viewports
- [ ] Task: Verify "All Completed" state (confetti) doesn't cause layout issues with sticky position
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Verification & Cleanup' (Protocol in workflow.md)
