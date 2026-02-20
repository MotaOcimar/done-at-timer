# Specification: Save and Reuse Routines

## 1. Goal
Provide a way to save the current list of tasks as a "Routine" and load previously saved routines.

## 2. Requirements
- **Persistence:** Saved routines must persist in `localStorage`.
- **Save:** User can name the current list and save it as a routine.
- **Load:** User can see a list of saved routines and select one to replace the current task list.
- **Delete:** User can remove saved routines.
- **Data Structure:** A routine consists of a `name` and an array of task templates (`title`, `duration`).

## 3. UI/UX
- A new section or modal to manage routines.
- "Save Current as Routine" button.
- A list of saved routines with "Load" and "Delete" actions.
- Clear feedback when a routine is loaded.
