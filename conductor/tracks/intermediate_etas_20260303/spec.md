# Track Specification: Intermediate Arrival Times (Inline ETAs)

## 1. Overview
The **Intermediate Arrival Times** feature provides per-task ETA information directly inside each task card. Instead of only seeing the final arrival time in the header, users will see the specific time each task is expected to finish — inline, without leaving the card or adding new UI elements between cards.

This aligns with the app's core philosophy: shifting focus from "how long" to "what time."

## 2. Functional Requirements

### 2.1 ETA Calculation Logic
- **Completed Tasks:** Display the **actual** wall-clock time the task was finished (stored as `completedAt` timestamp).
- **Active Task:** Display the **expected** finish time derived from `targetEndTime`.
- **Pending Tasks:**
  - Calculate the finish time by adding the task's duration to the finish time of the *previous* task in order.
  - If there is no active task, the first pending task starts "now".
- **Dynamic Updates:** All expected ETAs (Active and Pending) must update in real-time (every second).

### 2.2 Inline ETA Placement
The ETA is displayed **inside** each task card — no new elements are injected between cards.

**Active card — progress footer:**
The existing "X min left" label in the progress section footer is **replaced** by the task's ETA (e.g., `→ 08:35`), right-aligned. The progress bar already communicates remaining time visually, making the textual countdown redundant.

**Active card — subtitle line:**
The existing `X min total` label gains the remaining time: `20 min total · 12 min left`. This preserves the countdown information in a compact form alongside the duration, grouping duration-related info together.

**Pending cards — subtitle line:**
The ETA appears right-aligned on the subtitle/duration line (e.g., `15 min` on the left, `08:50` on the right).

**Completed cards — subtitle line:**
The actual completion time appears right-aligned on the subtitle line (e.g., `20 min (took 18 min)` on the left, `08:32` on the right).

### 2.3 Data Persistence
- When a task is completed, its **actual completion timestamp** (`completedAt`) must be recorded in the `Task` type to ensure the displayed time remains accurate after a page refresh.

## 3. UI/UX Requirements
- **Style:** Discrete and small (`text-xs font-mono`) to avoid competing with the task title or primary controls.
- **Color Coding:**
  - Completed: Gray — neutral, past event.
  - Active (running): Blue — matches the active card theme.
  - Active (overtime): Amber — matches overtime state.
  - Active (paused): Gray — matches paused state.
  - Pending: Gray — subtle, future projection.
- **Consistency:** The ETA occupies the same conceptual position (right side of the card's info area) across all card states, creating a scannable vertical column of times.

## 4. Acceptance Criteria
- [ ] Every task in the list displays a finish time (projected ETA or actual completion time).
- [ ] The ETA is displayed inline within each task card — no elements are added between cards.
- [ ] The active card's progress footer shows the ETA in place of the previous "X min left" label.
- [ ] The active card's subtitle shows remaining time alongside total duration (e.g., `20 min total · 12 min left`).
- [ ] The ETAs for Active and Pending tasks update dynamically as time passes.
- [ ] Reordering tasks via drag-and-drop immediately recalculates and updates all pending ETAs.
- [ ] The final ETA in the list matches the main "Arrival Clock" at the top of the screen.
- [ ] Drag-and-drop behavior is unaffected (no new elements interfere with SortableContext).

## 5. Out of Scope
- Ability to manually set a target finish time for a specific task.
- Notifications for intermediate checkpoints (notifications remain only for the active task ending).
- A vertical timeline or connector elements between cards.
