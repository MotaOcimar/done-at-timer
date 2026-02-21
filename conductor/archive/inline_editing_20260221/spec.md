# Specification: Inline Task Editing

## Overview
Allow users to edit the name and duration of any task directly within the list by clicking on the text. This improves flexibility, allowing for quick corrections or adjustments without deleting and re-adding tasks.

## Functional Requirements

### 1. Interaction
- **Trigger:** Clicking the **Task Name** or **Task Duration** text transforms the element into an editable input field.
- **Save:** Blurring the input (clicking outside) or pressing `Enter` saves the changes.
- **Cancel:** Pressing `Escape` cancels the edit and reverts to the original value.

### 2. State Logic
- **Pending/Completed Tasks:** Updates the task properties in the global store immediately.
- **Running Task (Name):** Updates the displayed name immediately.
- **Running Task (Duration):**
  - Changing the duration of the *active* task must adjust the `targetEndTime` to preserve the time already elapsed.
  - **Logic:** `NewTarget = OldTarget + (NewDuration - OldDuration)`.
  - *Example:* If a 20m task is 50% done (10m left) and is changed to 30m, it should now have 20m left.

### 3. Validation
- **Name:** Cannot be empty. If the user saves an empty string, revert to the original name.
- **Duration:** Must be a positive integer greater than 0.

## Non-Functional Requirements
- **Visuals:** The input fields should mimic the style (font size, alignment) of the text they replace to prevent layout shifts.
- **Accessibility:** Inputs must receive focus automatically when triggered and handle keyboard navigation standardly.