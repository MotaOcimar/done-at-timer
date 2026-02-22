# Implementation Plan: Sticky Arrival Time

This plan details the steps to implement a sticky `ArrivalDisplay` component at the top of the screen.

## Phase 1: Layout & Style Refinement
Goal: Prepare the application layout to support a sticky header without layout shifts.

- [x] Task: Create a new test file `src/integration.sticky.test.tsx` to verify sticky behavior (TDD Red Phase) 549bd5c
- [x] Task: Update `App.tsx` or `Layout.tsx` to wrap `ArrivalDisplay` in a sticky container 549bd5c
- [x] Task: Apply `sticky top-0 z-50` and ensure the background is solid/opaque (TDD Green Phase) 549bd5c
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Layout & Style Refinement' (Protocol in workflow.md)

## Phase 2: Visual Separation & Polish
Goal: Ensure the sticky header looks good and provides clear visual feedback when content scrolls underneath.

- [x] Task: Fix mobile scroll blockage by moving `touch-action: none` from the card to the drag handle 549bd5c
- [x] Task: Add a subtle shadow or bottom border to `ArrivalDisplay` that appears/enhances when sticky 549bd5c
- [x] Task: Replace solid border with a gradient fade (neblina) for a smooth "feathered" transition 549bd5c
- [x] Task: Fix clipped shadow by increasing container padding and adjusting neblina position 549bd5c
- [x] Task: Verify that `TaskList` items pass correctly behind the sticky header (z-index check) 549bd5c
- [x] Task: Ensure `TaskInput` is still accessible and visible at the bottom of the viewport 549bd5c
- [x] Task: Conductor - User Manual Verification 'Phase 2: Visual Separation & Polish' (Protocol in workflow.md) 549bd5c

## Phase 3: Final Verification & Cleanup
Goal: Ensure the feature works perfectly across different screen sizes and states.

- [x] Task: Verify sticky behavior on mobile viewports (Confirmed via manual feedback and touch-action fix) 549bd5c
- [x] Task: Verify "All Completed" state (confetti) doesn't cause layout issues with sticky position 549bd5c
- [x] Task: Conductor - User Manual Verification 'Phase 3: Final Verification & Cleanup' (Protocol in workflow.md) 549bd5c
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Verification & Cleanup' (Protocol in workflow.md)
