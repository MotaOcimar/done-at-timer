# Specification - Backlog Refinement (UI/UX)

## 1. Goal
Improve the user experience and visual polish of the "Done-At" Timer by addressing specific UI/UX issues identified in the backlog.

## 2. Requirements

### 2.1 Site Metadata
- Change the `<title>` in `index.html` from "temp-project" to "Done-At Timer".

### 2.2 Task Input Order
- Verify that new tasks are added to the end of the `tasks` array in the store.
- Ensure the UI reflects this (newest tasks at the bottom).

### 2.3 Play Icon Alignment
- Adjust the SVG or its container in `TaskItem.tsx` to ensure the "Play" triangle is visually centered within its circular background. 
- *Note:* Often, a triangle feels off-center if mathematically centered because of its weight distribution; it might need a slight horizontal offset.

### 2.4 Task/Active UI Merge
- Remove the standalone `ActiveTask` component from the top of the app.
- When a task is "IN_PROGRESS":
  - The `TaskItem` for that task should expand or change style to include the timer, progress bar, and "Mark as Done" controls.
  - The rest of the list should remain visible below or around it.
  - Maintain "Arrival Time" functionality.

## 3. Technical Constraints
- Keep using Tailwind CSS for styling.
- Maintain Zustand for state management.
- Ensure transitions remain smooth.
