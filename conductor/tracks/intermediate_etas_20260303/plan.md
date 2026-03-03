# Implementation Plan: Intermediate Arrival Times (Timeline Checkpoints)

This plan details the steps to implement intermediate ETAs for each task, visualized as a timeline with checkpoints.

## Phase 1: State & Logic (Data Integrity)
Goal: Ensure the application has the necessary data to track past and future completion times.

- [ ] Task: Update `Task` type in `src/types/index.ts` to include optional `completedAt` (timestamp) property.
- [ ] Task: Update `completeActiveTask` in `src/store/useTaskStore.ts` to record the current time in `completedAt` when a task is finished.
- [ ] Task: Create a utility function `calculateIntermediateETAs` (or a custom hook) to compute finish times for all tasks based on the current state.
- [ ] Task: Write unit tests in `src/utils/time.test.ts` or a new test file to verify ETA calculation (including completed, active, and pending scenarios).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: State & Logic (Data Integrity)' (Protocol in workflow.md)

## Phase 2: UI Components (Timeline Visualization)
Goal: Display the calculated times between task cards in a minimalist and discrete way.

- [ ] Task: Create a `TimelineCheckpoint` component to display the timestamp and a subtle vertical line segment.
- [ ] Task: Update `TaskList.tsx` to inject `TimelineCheckpoint` components between task cards.
- [ ] Task: Update `TaskItem.tsx` to display the "Finished at HH:MM" label for completed tasks.
- [ ] Task: Apply minimalist styles (small font, low opacity, gray colors) to ensure the feature doesn't clutter the UI.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Components (Timeline Visualization)' (Protocol in workflow.md)

## Phase 3: Real-time Updates & Polish
Goal: Ensure the ETAs feel "alive" and respond correctly to time passing and task reordering.

- [ ] Task: Ensure the intermediate ETAs update dynamically as the current time drifts (similar to the main Arrival Clock).
- [ ] Task: Verify that drag-and-drop reordering (`TaskList.tsx`) correctly triggers a recalculation of all pending ETAs.
- [ ] Task: Conduct a final visual review to ensure the timeline connector looks cohesive and doesn't interfere with interaction (drag handle, buttons).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Real-time Updates & Polish' (Protocol in workflow.md)
