# Implementation Plan - UX Refinement & Reliability

## Phase 1: Reliability & Logic Refactor
- [x] Task: Refactor Store for Timestamps (c67151f)
    - [x] Add `activeTaskId` and `targetEndTime` (timestamp) to `useTaskStore`
    - [x] Add `totalElapsedBeforePause` to handle pausing/resuming without drift
    - [x] Update `setActiveTaskTimeLeft` to be derived from timestamps
- [x] Task: Reliable `useTimer` Hook (de5722d)
    - [x] Refactor hook to calculate `timeLeft` based on `Date.now()` vs `targetEndTime`
    - [x] Remove `setInterval` dependency for accuracy (use it only for UI refreshes)
- [~] Task: Conductor - User Manual Verification 'Phase 1: Reliability & Logic Refactor' (Protocol in workflow.md)

## Phase 2: Playlist UI Model
- [ ] Task: Playlist-style Task Items
    - [ ] Update `TaskItem` to show a "Play" button
    - [ ] Implement `startTask(id)` in store that handles logic:
        - If another task was running, pause it or mark as pending.
        - Set the new task as `IN_PROGRESS` and calculate its `targetEndTime`.
- [ ] Task: Remove Legacy Controls
    - [ ] Remove `RoutineControls` (Start Routine button) as it's now redundant
    - [ ] Update `ActiveTask` to reflect the playlist selection
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Playlist UI Model' (Protocol in workflow.md)

## Phase 3: Visual Calmness & Polish
- [ ] Task: Progress Bar Component
    - [ ] Create a `ProgressBar` component with smooth transitions
    - [ ] Replace ticking seconds in `ActiveTask` with the progress bar
- [ ] Task: Discrete Time Remaining
    - [ ] Update UI to show "X min left" instead of "MM:SS"
    - [ ] Ensure `ArrivalDisplay` remains the primary focus
- [ ] Task: Final Reliability Check
    - [ ] Verify background behavior on mobile
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Visual Calmness & Polish' (Protocol in workflow.md)
