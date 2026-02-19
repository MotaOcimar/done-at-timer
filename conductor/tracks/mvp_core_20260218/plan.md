# Implementation Plan - MVP Core

## Phase 1: Project Setup & Core Logic [checkpoint: 9c524e8]

- [x] Task: Initialize Project (Vite + React + TS) [b8e0e47]

    - [x] Create Vite project

    - [x] Install Tailwind CSS

    - [x] Configure ESLint/Prettier

    - [x] Setup Vitest & React Testing Library
- [x] Task: Implement Task Domain Model [a8eefb9]
    - [x] Define `Task` interface (id, title, duration, status)
    - [x] Create `useTaskStore` with Zustand (add, remove, update actions)
    - [x] Write unit tests for store logic (adding/removing tasks)
- [x] Task: Implement Arrival Time Logic [019f3ba]
    - [x] Write utility function `calculateArrivalTime(tasks: Task[], currentTime: Date): Date`
    - [x] Write unit tests for time calculation (various durations, crossing midnight, etc.)  - [ ] Write unit tests for time calculation (various durations, crossing midnight, etc.)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Project Setup & Core Logic' (Protocol in workflow.md)

## Phase 2: Task List Management (UI) [checkpoint: 70987e5]

- [x] Task: Create Basic Layout [4bcd416]

    - [x] Create `Layout` component with responsive container

    - [x] Apply "Minimalist" background and font styles

- [x] Task: Task Input Component [21df34f]

    - [x] Create `TaskInput` component (Name + Duration fields)

    - [x] Write tests for input validation and submission

    - [x] Integrate with `useTaskStore` to add tasks

- [x] Task: Task List Component [a7c8e63]

    - [x] Create `TaskList` component to render list of tasks

    - [x] Create `TaskItem` component (display title, duration)

    - [x] Implement Delete/Edit actions in UI

    - [x] Write tests for rendering list and interactions

- [x] Task: Persist to Local Storage [f25a92d]

    - [x] Enable Zustand persist middleware

    - [x] Verify data persistence manually (reload page)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Task List Management (UI)' (Protocol in workflow.md)

## Phase 3: "Done-At" Display & Timer Logic

- [x] Task: Arrival Time Display Component [614884e]

    - [x] Create `ArrivalDisplay` component

    - [x] Connect to store to get total remaining time

    - [x] Implement live clock update (useEffect interval)

    - [x] Write tests for correct time formatting and updates

- [x] Task: Timer Hook & Logic [5c08846]

    - [x] Create `useTimer` hook (start, pause, reset, tick)

    - [x] Implement countdown logic

    - [x] Write unit tests for timer hook

- [~] Task: Active Task View

    - [ ] Create `ActiveTask` component (Big Countdown)

    - [ ] Integrate `useTimer` with the current active task

    - [ ] Implement "Mark as Done" button
- [ ] Task: Conductor - User Manual Verification 'Phase 3: "Done-At" Display & Timer Logic' (Protocol in workflow.md)

## Phase 4: Integration & Polish

- [ ] Task: Sequential Execution Logic
  - [ ] Implement "Start Routine" button
  - [ ] Handle transition: Task Complete -> Start Next Task
  - [ ] Update store status (PENDING -> IN_PROGRESS -> COMPLETED)
- [ ] Task: Styling & UX Refinement
  - [ ] Apply "Playful" colors (Tailwind config)
  - [ ] Add transitions for adding/removing tasks
  - [ ] Style the "Arrival Time" to be prominent
- [ ] Task: Mobile Responsiveness Check
  - [ ] Verify layout on mobile viewports
  - [ ] Adjust touch targets (buttons)
- [ ] Task: Final Polish
  - [ ] clear console logs
  - [ ] Check accessibility (contrast, labels)
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Integration & Polish' (Protocol in workflow.md)
