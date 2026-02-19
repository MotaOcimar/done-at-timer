# Track Specification: MVP Core - "Done-At" Timer

## Overview
This track focuses on delivering the Minimum Viable Product (MVP) of the "Done-At" Timer application. The goal is to provide users with a functional tool to list tasks with durations and see a real-time "Arrival Time" (predicted completion time) based on the remaining work.

## Core Features
1.  **Task Management:**
    -   Create tasks with a name and duration (in minutes).
    -   Edit task details.
    -   Delete tasks.
    -   Persist the task list in the browser's Local Storage.
2.  **"Done-At" Prediction:**
    -   Calculate the total remaining duration of all tasks in the list.
    -   Display the projected "Arrival Time" (Current Time + Total Remaining Duration).
    -   Update the arrival time dynamically every minute or upon task completion.
3.  **Task Execution:**
    -   Start the first task in the list (Sequential Execution).
    -   Show a countdown timer for the active task.
    -   Mark a task as complete and automatically queue the next task.
    -   Allow manual "Mark as Done" even if time remains.

## Technical Implementation
-   **Framework:** React + TypeScript + Vite.
-   **Styling:** Tailwind CSS (Minimalist but Playful).
-   **State Management:** Zustand (for task list and timer state).
-   **Persistence:** `localStorage` via Zustand middleware.
-   **Testing:** Vitest + React Testing Library (Unit tests for logic and components).

## Acceptance Criteria
-   [ ] User can add multiple tasks to a list.
-   [ ] User sees the correct "Arrival Time" based on the sum of task durations.
-   [ ] User can start the first task and see a countdown.
-   [ ] When a task is completed, it is visually marked, and the "Arrival Time" is recalculated based on *remaining* tasks.
-   [ ] Data persists across page reloads.
-   [ ] The UI is responsive and usable on mobile devices.
