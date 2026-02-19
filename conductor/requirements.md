# Product Requirements (MVP)

## User Stories
1.  **Create Task List:**
    -   As a user, I want to create a list of tasks with durations (in minutes).
    -   As a user, I want to edit or delete tasks from the list.
    -   *Constraint:* Initially, the list will be sequential.
2.  **View Arrival Time:**
    -   As a user, I want to see a prominent "Arrival Time" that calculates the finish time of the *remaining* tasks based on the current time.
    -   The calculation must update dynamically as time passes.
3.  **Task Execution:**
    -   As a user, I want to start the first task in the list.
    -   As a user, I want to see a countdown for the current task.
    -   When a task finishes, the next one should be ready to start.
4.  **Persistence:**
    -   As a user, I want my task list to be saved automatically (in Local Storage) so I don't lose it if I close the browser.

## Non-Functional Requirements
-   **Performance:** The arrival time calculation must be instant and lightweight.
-   **UI/UX:** Adhere to the "Minimalist but Playful" guidelines.
-   **Tech Stack:** React + TypeScript + Tailwind CSS.
