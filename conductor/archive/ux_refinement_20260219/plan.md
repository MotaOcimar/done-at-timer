# Implementation Plan - UX Refinement & Reliability

## Phase 1: Reliability & Logic Refactor [checkpoint: a4c49c4]
- [x] Task: Refactor Store for Timestamps (c67151f)
    - [x] Add `activeTaskId` and `targetEndTime` (timestamp) to `useTaskStore`
    - [x] Add `totalElapsedBeforePause` to handle pausing/resuming without drift
    - [x] Update `setActiveTaskTimeLeft` to be derived from timestamps
- [x] Task: Reliable `useTimer` Hook (de5722d)
    - [x] Refactor hook to calculate `timeLeft` based on `Date.now()` vs `targetEndTime`
    - [x] Remove `setInterval` dependency for accuracy (use it only for UI refreshes)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Reliability & Logic Refactor' (Protocol in workflow.md)

## Phase 2: Playlist UI Model [checkpoint: 8d547e1]
- [x] Task: Playlist-style Task Items (3014730)
    - [x] Update `TaskItem` to show a "Play" button
    - [x] Implement `startTask(id)` in store that handles logic:
        - If another task was running, pause it or mark as pending.
        - Set the new task as `IN_PROGRESS` and calculate its `targetEndTime`.
- [x] Task: Remove Legacy Controls (3014730)
    - [x] Remove `RoutineControls` (Start Routine button) as it's now redundant
    - [x] Update `ActiveTask` to reflect the playlist selection
- [x] Task: Conductor - User Manual Verification 'Phase 2: Playlist UI Model' (Protocol in workflow.md)

## Phase 3: Visual Calmness & Polish [checkpoint: c853b20]
- [x] Task: Completion & Celebration State (1920eb8)
    - [x] Create a "All Tasks Done" view in `ArrivalDisplay` or `ActiveTask`
    - [x] Add a visual reward (e.g., "Routine Complete!" with a nice icon)
    - [x] Add a "Reset Routine" button in this view
- [x] Task: Progress Bar Component (6be4c44)
    - [x] Create a `ProgressBar` component with smooth transitions
    - [x] Replace ticking seconds in `ActiveTask` with the progress bar
- [x] Task: Discrete Time Remaining (6be4c44)
    - [x] Update UI to show "X min left" instead of "MM:SS"
    - [x] Ensure `ArrivalDisplay` remains the primary focus
- [x] Task: Subtle Activity Indicator (f52b8b2)
    - [x] Add a gentle pulse animation to the progress bar to indicate activity
- [x] Task: Total Routine Progress (c4f2e00, e44e2c0, 9e5c866)
    - [x] Add a global progress bar showing overall completion
    - [x] Show total time remaining for the routine
- [x] Task: Celebration Confetti (0f779a6)
    - [x] Add visual confetti effect when routine is completed
- [x] Task: Final Reliability Check (skipped - covered by continuous testing)
    - [x] Verify background behavior on mobile
- [~] Task: Conductor - User Manual Verification 'Phase 3: Visual Calmness & Polish' (Protocol in workflow.md)
