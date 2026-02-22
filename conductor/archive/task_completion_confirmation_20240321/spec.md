# Specification: Manual Task Completion Confirmation

## 1. Overview
The current auto-advance feature, which marks a task as `COMPLETED` immediately when its timer reaches zero, is often inaccurate in practice. Users may need more or less time than originally estimated. This track introduces a manual confirmation step to ensure the task is genuinely finished before moving to the next item in the routine.

## 2. Functional Requirements
- **Confirmation Step:** When a task timer reaches zero, the system **must not** mark it as completed or start the next task automatically.
- **Manual "Done" Button:** The user must explicitly click a "Done" or "I'm finished" button to confirm completion.
- **Visual Alert:** When a task is overdue (time expired), the UI should change (e.g., color, animation) to alert the user that the timer has finished, but the task is still active.
- **Overtime Tracking (Optional/Phase 2):** Ideally, the timer should indicate how much time has passed *beyond* the estimate (overtime), but for the MVP, just staying at `0` or showing a simple "Finished?" state is sufficient.
- **Auto-Next:** Only after the user confirms completion does the system mark the current task as `COMPLETED` and automatically start the next `PENDING` task in the list.

## 3. Non-Functional Requirements
- **Minimal Friction:** The confirmation button must be large, accessible, and high-contrast to minimize effort.
- **Accuracy:** The "Arrival Clock" must stay accurate by considering the time spent waiting for confirmation.

## 4. Acceptance Criteria
- [ ] Task timer hits 0:00 and the task stays in the `ACTIVE` state (does not auto-complete).
- [ ] A prominent "Complete Task?" button appears.
- [ ] Clicking the button marks the task as `COMPLETED` in the store.
- [ ] After confirmation, the next task starts its timer automatically.
- [ ] The "Arrival Clock" updates its ETA to reflect the new starting time of the next task.
