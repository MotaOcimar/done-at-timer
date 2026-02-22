# Implementation Plan: Manual Task Completion Confirmation

This plan introduces a manual confirmation step when a task timer expires, ensuring the user confirms completion before moving to the next task.

## Phase 1: Store & Core Logic [checkpoint: ]
- [ ] Task: Extend `TaskState` to track if the current task has finished its allotted time but not yet been confirmed as completed.
    - [ ] Red: Write test for `useTaskStore` ensuring that a task does NOT auto-complete when its duration expires.
    - [ ] Green: Update the store to separate "time expired" from "task completed".
- [ ] Task: Update the `completeTask` action to also start the next task (if any) and reset the timer for the new active task.
    - [ ] Red: Test that completing an active task with a manual action starts the next pending task automatically.
    - [ ] Green: Implement the `completeActiveTask` action in `useTaskStore`.

## Phase 2: Timer & Hook Refactor
- [ ] Task: Refactor `useTimer` to allow the timer to reach 0 (or negative) without forcing an external state change in the store.
    - [ ] Red: Write test for `useTimer` verifying that it can signal "completion" but stay at 0 or continue counting.
    - [ ] Green: Modify the `useTimer` to signal "time up" while remaining active.

## Phase 3: UI Implementation & UX Polish
- [ ] Task: Implement the "Confirm Completion" button in `TaskCard`.
    - [ ] Red: Write test for `TaskCard` ensuring it displays a "Did you finish?" or "Done" button when the time is up.
    - [ ] Green: Add a conditional UI state for "Time Up" in `TaskCard` with a prominent completion button.
- [ ] Task: Ensure the next task starts automatically ONLY after confirmation.
    - [ ] Red: Integration test for `TaskList` to verify the flow: Task 1 finishes -> UI asks for confirmation -> User clicks "Done" -> Task 1 is completed -> Task 2 starts.
    - [ ] Green: Final UI/Store synchronization.
