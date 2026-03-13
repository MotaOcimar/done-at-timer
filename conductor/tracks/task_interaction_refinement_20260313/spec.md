# Specification: Task Interaction Refinement & Cleanup

## Overview
This track aims to refine task interactions and clean up the UI by removing redundant elements and introducing a swipe-to-delete pattern.

## Functional Requirements
- **Whole Card Dragging**: Tasks can be reordered by dragging from any part of the task card.
- **Remove Drag Handles**: The existing drag handles (Lucide icons with "2 lines") on the left side of task cards are removed to reclaim space.
- **Swipe-to-Delete**:
    - Swiping a task card from right to left reveals a "Delete" action area "behind" the card.
    - This revealed state ("Reveal & Stay") persists until the user either clicks "Delete" or swipes back to dismiss.
- **Delete Confirmation**: The "Delete" button is revealed behind the card, and clicking it confirms the deletion.
- **Remove Inline Delete Button**: The current delete button on the task card is removed.

## Non-Functional Requirements
- **Performance**: Swipe interactions should be smooth and responsive.
- **Accessibility**: Ensure that the swipe-to-delete action and the revealed button are accessible via keyboard and screen readers (if applicable).

## Acceptance Criteria
- [ ] Task cards no longer have the "2 lines" drag handle.
- [ ] Dragging from anywhere on a task card initiates reordering.
- [ ] Swiping a task from right to left reveals a "Delete" button behind the card.
- [ ] Clicking the revealed "Delete" button removes the task.
- [ ] Swiping back (left to right) hides the "Delete" button.
- [ ] The existing delete button within the task card is gone.

## Out of Scope
- Changing the overall app layout or sidebars (only task-level interaction refinements).
- Adding multi-select for deletion.