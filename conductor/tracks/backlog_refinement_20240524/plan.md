# Implementation Plan - Backlog Refinement [checkpoint: 6c63557]

## Phase 1: Quick Fixes & Metadata [checkpoint: 6c63557]

- [x] Task: Update site title in `index.html`
- [x] Task: Verify task addition order in `useTaskStore.ts`
- [x] Task: Center Play icon in `TaskItem.tsx`

## Phase 2: UI Merge (Active Task into Task Item) [checkpoint: 6c63557]

- [x] Task: Refactor `TaskItem.tsx` to handle active state UI
    - [x] Move `ProgressBar` and timer logic/display into `TaskItem`
    - [x] Add "Done" and "Pause/Resume" buttons to `TaskItem` (for active state)
- [x] Task: Update `App.tsx` to remove the separate `ActiveTask` component
- [x] Task: Ensure smooth transitions between PENDING and IN_PROGRESS states in `TaskItem`

## Phase 3: Cleanup & Verification [checkpoint: 6c63557]

- [x] Task: Remove `src/components/ActiveTask.tsx` if no longer needed
- [x] Task: Verify overall app flow and "Arrival Time" accuracy

## Phase 4: Design Consistency & SOLID Refactor [checkpoint: 6c63557]

- [x] Task: Refactor `TaskItem.tsx` using SOLID principles (extract sub-components)
- [x] Task: Standardize Action/Status icon containers for perfect vertical alignment
- [x] Task: Unify duration text styling and positioning across all states
- [x] Task: Update tests to verify structural consistency
