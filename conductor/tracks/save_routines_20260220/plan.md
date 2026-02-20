# Implementation Plan - Save and Reuse Routines

## Phase 1: Data Layer (Store)

- [x] Task: Update `useTaskStore.ts` to include `routines` state and actions (`saveRoutine`, `loadRoutine`, `deleteRoutine`) (1378805)
- [x] Task: Add unit tests for routine management in a new store test file (1378805)

## Phase 2: UI Implementation

- [~] Task: Create a `RoutineManager` component to display and manage saved routines
- [ ] Task: Integrate `RoutineManager` into the main `App` layout
- [ ] Task: Add a "Save Current" button/form near the task list

## Phase 3: UX Refinement

- [ ] Task: Add confirmation when loading a routine if the current list is not empty
- [ ] Task: Final polish and responsive check
