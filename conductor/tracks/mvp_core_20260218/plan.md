# Implementation Plan - MVP Core

## Phase 1: Project Setup & Core Logic

- [x] Task: Initialize Project (Vite + React + TS) [b8e0e47]

    - [x] Create Vite project

    - [x] Install Tailwind CSS

    - [x] Configure ESLint/Prettier

    - [x] Setup Vitest & React Testing Library
- [x] Task: Implement Task Domain Model [a8eefb9]
    - [x] Define `Task` interface (id, title, duration, status)
    - [x] Create `useTaskStore` with Zustand (add, remove, update actions)
    - [x] Write unit tests for store logic (adding/removing tasks)
- [ ] Task: Implement Arrival Time Logic
  - [ ] Write utility function `calculateArrivalTime(tasks: Task[], currentTime: Date): Date`
  - [ ] Write unit tests for time calculation (various durations, crossing midnight, etc.)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Project Setup & Core Logic' (Protocol in workflow.md)

## Phase 2: Task List Management (UI)

- [ ] Task: Create Basic Layout
  - [ ] Create `Layout` component with responsive container
  - [ ] Apply "Minimalist" background and font styles
- [ ] Task: Task Input Component
  - [ ] Create `TaskInput` component (Name + Duration fields)
  - [ ] Write tests for input validation and submission
  - [ ] Integrate with `useTaskStore` to add tasks
- [ ] Task: Task List Component
  - [ ] Create `TaskList` component to render list of tasks
  - [ ] Create `TaskItem` component (display title, duration)
  - [ ] Implement Delete/Edit actions in UI
  - [ ] Write tests for rendering list and interactions
- [ ] Task: Persist to Local Storage
  - [ ] Enable Zustand persist middleware
  - [ ] Verify data persistence manually (reload page)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Task List Management (UI)' (Protocol in workflow.md)

## Phase 3: "Done-At" Display & Timer Logic

- [ ] Task: Arrival Time Display Component
  - [ ] Create `ArrivalDisplay` component
  - [ ] Connect to store to get total remaining time
  - [ ] Implement live clock update (useEffect interval)
  - [ ] Write tests for correct time formatting and updates
- [ ] Task: Timer Hook & Logic
  - [ ] Create `useTimer` hook (start, pause, reset, tick)
  - [ ] Implement countdown logic
  - [ ] Write unit tests for timer hook
- [ ] Task: Active Task View
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
