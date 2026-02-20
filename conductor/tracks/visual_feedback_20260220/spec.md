# Specification: Visual Feedback for Completed Tasks

## 1. Goal
Provide clear visual feedback when a task is completed.

## 2. Requirements
- Completed tasks in the `TaskList` must:
  - Be dimmed (reduced opacity).
  - Have a strikethrough on the title.
  - Display a checkmark icon instead of the "Play" button.
- Transitions should be smooth.

## 3. UI/UX Details
- **Opacity:** 50% for completed items.
- **Icon:** `CheckCircle` or similar from Lucide.
- **Title:** `line-through` decoration.
