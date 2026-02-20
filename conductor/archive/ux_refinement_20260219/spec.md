# Track Specification: UX Refinement & Reliability

## Overview
Based on user feedback, this track focuses on making the timer technically reliable (handling background/sleep states) and improving the UI to be less distracting while more flexible (playlist model).

## Core Features
1.  **Reliable Timer (Anti-Drift):**
    - Replace countdown-based timer with timestamp-based logic.
    - Store `startTime` and `targetEndTime` in the store.
    - Calculate remaining time by comparing `Date.now()` with `targetEndTime`.
2.  **Playlist-Style Execution:**
    - Remove the forced sequential execution model.
    - Each task in the list gets a "Play" button.
    - Starting a new task automatically pauses/completes the previous one (or simply shifts focus).
    - Maintain the "Done-At" calculation based on the currently active task + all other non-completed tasks.
3.  **Visual Calmness (Progress Bars):**
    - Replace the large, ticking second-by-second countdown with a visual progress bar.
    - Show remaining time in a more discrete way (e.g., "5 min left").
    - Focus the UI on the "Arrival Time" while keeping the active task as a secondary, quiet indicator.

## Technical Implementation
- Update `useTaskStore` to track `activeTaskId` and `targetEndTime`.
- Refactor `useTimer` hook to accept a target timestamp.
- Redesign `TaskItem` to include inline playback controls.
- Redesign `ActiveTask` to be more minimalist and less "busy".

## Acceptance Criteria
- [ ] Timer remains accurate even if the browser/phone was in background for several minutes.
- [ ] User can click 'Play' on any task in the list to start it immediately.
- [ ] Active task shows progress via a bar instead of ticking seconds.
- [ ] Arrival Time updates correctly when switching between different tasks.
