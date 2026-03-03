# Track Specification: Intermediate Arrival Times (Timeline Checkpoints)

## 1. Overview
The **Intermediate Arrival Times** feature aims to provide granular "ETA" information for every step in a routine. Instead of only seeing the final arrival time at the top of the screen, users will see the specific time each task is expected to finish, visualized as a "checkpoint" on a timeline.

## 2. Functional Requirements

### 2.1 ETA Calculation Logic
- **Completed Tasks:** Display the **actual** time the task was finished (using the stored `completionTime` or similar).
- **Active Task:** Display the **expected** finish time (`targetEndTime`).
- **Pending Tasks:**
  - Calculate the finish time by adding the task's duration to the finish time of the *previous* task.
  - If there is no active task, the first pending task starts "now".
- **Dynamic Updates:** All expected ETAs (Active and Pending) must update in real-time as the clock drifts (every second/minute).

### 2.2 Task "Checkpoint" Placement
- The timestamp must be placed **between** two task cards (or at the bottom of a card) to represent the transition point where one task ends and the next begins.
- Visually, it should act as a "connector" on a vertical timeline.

### 2.3 Data Persistence
- When a task is completed, its **actual completion timestamp** must be recorded in the state (`Task` type) to ensure the timeline remains accurate for past events after a page refresh.

## 3. UI/UX Requirements
- **Style:** Discrete, minimalist, and small font (e.g., `text-xs font-mono text-gray-400`).
- **Layout:** 
  - A subtle vertical line segment on the right or left of the task list to reinforce the "Timeline" metaphor.
  - The timestamp (e.g., `14:30`) should be centered or right-aligned between the cards.
- **Color Coding:**
  - Completed: Neutral (Gray).
  - Active/Pending: Matches the "Arrival Clock" state (e.g., Primary color or Amber if drifting/overtime).

## 4. Acceptance Criteria
- [ ] Every task in the list displays a finish time (ETA or actual).
- [ ] Timestamps are placed in the gap between task cards.
- [ ] The ETAs for the Active and Pending tasks update dynamically as time passes.
- [ ] Reordering tasks via drag-and-drop immediately recalculates and updates all intermediate ETAs.
- [ ] The final ETA in the list matches the main "Arrival Clock" at the top of the screen.

## 5. Out of Scope
- Ability to manually set a target finish time for a specific task.
- Notifications for intermediate checkpoints (notifications remain only for the active task ending).
