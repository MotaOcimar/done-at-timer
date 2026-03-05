# Project Backlog

This file tracks all ideas, requested improvements, and roadmap items for future implementation.

## Priority Improvements (Current Focus)
- [ ] **Arrival Clock Z-index Bug**: The Arrival Clock remains visible and unblurred when modals (Save Routine) or the side library are open. This is due to the sticky header having a higher z-index than the backdrop.
- [ ] **UI Color Palette Refinement**: 
    - **Softer Overtime Color**: Replace the heavy amber color with a more pleasant, less "alarming" tone to maintain the app's positive coaching vibe.
    - **Neutral Paused State**: Use a neutral color (e.g., gray) for the active task when it is paused, as pausing is often a neutral/intentional decision.
    - **Neutral Idle State**: Ensure tasks that haven't been started yet (Pending) use neutral colors. Currently, the play button uses blue even when not running, which is confusing.
- [ ] **Minutes Input Bug**: On desktop, the minutes input shows spin buttons (up/down arrows) that obscure the number inside. Hide these buttons via CSS for a cleaner, consistent UI.
- [ ] **Sticky Arrival Time**: The Arrival Time display should remain fixed/sticky at the top of the screen when scrolling through a long list of tasks.
- [ ] **Arrival Status Icons**: 
    - Replace or augment the "drifting" text with meaningful icons next to the Arrival Clock.
    - **GPS Pin**: Show a static Map/GPS Pin when the timer is running, indicating the arrival time is "locked" or "guaranteed" based on current progress.
    - **Rotating Clock**: Show an animated/rotating clock icon when the timer is paused or in overtime, indicating the arrival time is "drifting" forward in real-time.
- [x] **Task Input Order**: New tasks should be added to the bottom of the list to reduce visual clutter and maintain natural chronological order.
- [x] **Play Icon Alignment**: Center the play icon within its circular button/container in `TaskItem`.
- [x] **Task/Active Merge**: Simplify the UI by transforming the task item itself into the "Active Task" view when played, instead of showing a separate box at the top.
- [x] **Site Metadata**: Update the site title in `index.html` from "temp-project" to "Done-At Timer".

## Future Roadmap (from Product Definition)
- [ ] **Full Card Drag and Drop**: Allow users to drag tasks by clicking anywhere on the card, not just the handle. This would save horizontal space by removing the handle icon. Careful implementation is needed to avoid conflicts with interactive elements like text inputs and buttons.
- [ ] **Intermediate Arrival Times**: Display the estimated completion time for each individual task in the list, allowing users to see not just when they'll finish everything, but when they'll finish each step.
- [ ] **Media Style Notifications**: Instead of just simple complete notifications, use the Media Session API (or advanced PWA notifications) to show current task progress and provide play/pause controls, similar to music player notifications.
- [ ] **Paused Time Tracking**: Measure the time spent in paused state and represent it with a distinct color in the progress bar to show "drift".
- [ ] **Actual vs Estimated Comparison**: When a task is finished, display the actual duration. Show the original estimated time next to it with a strikethrough for easy comparison.
- [ ] **Mini Time Timers**: Add visual "time timers" (circular progress indicators) to represent remaining time for individual tasks and the total session.
- [ ] **Routine List Expansion**: Clicking a routine in the list expands it to show a preview with its task list and buttons to load or delete.
- [ ] **Dark Mode**: Implementation of a dark theme with a manual toggle for user preference.
- [ ] **Unified Animations**: Integrate an animation library (e.g., Framer Motion) to handle all entry/exit transitions for menus and modals.
- [ ] **Quick Complete**: Add a button to tasks in the list to mark them as completed even if they haven't been started.
- [ ] **Swipe to Delete**: Implement a mobile-friendly "swipe to the side" gesture to delete tasks from the list.
- [ ] **Inline Editing**: Allow users to edit task names and durations by simply clicking on them in the list.
- [ ] **Drag & Drop Reordering**: Enable drag-and-drop functionality to easily reorder tasks in the list.
- [ ] **Completion Checkpoint**:
    - Add an optional confirmation step when a task timer ends ("Did you actually finish?").
    - Include a toggle setting to enable/disable this manual confirmation (auto-advance vs. manual advance).
- [ ] **Automated Visual Documentation**: 
    - Implement a script (e.g., using Puppeteer or Playwright) to automatically generate screenshots of the application in different states (Active, Paused, Completed, Reordering).
    - Integrate these assets into a revitalized `README.md` and a new `FEATURES.md` to ensure the visual documentation stays in sync with UI changes without manual effort.
- [ ] **Refined Animations**: Change the "pulse" animation on progress bars to a "shimmer/wave" effect (left-to-right) to better convey forward momentum.

## Technical Debt
- [ ] **Per-task Progress Persistence**: Move the elapsed time tracking from the global `totalElapsedBeforePause` state into the `Task` type itself (e.g., `task.elapsedSeconds`). This ensures that partially completed tasks preserve their progress when the active task is switched or when they are moved back to pending, preventing them from "restarting" from zero when resumed. *Implementar junto com um botão "Reset Progress" na UI — uma vez que `elapsedSeconds` vive na tarefa, resetar é trivial (`task.elapsedSeconds = 0`).*
- [ ] **Code Comments**: Translate Portuguese comments in `src/hooks/useTimer.ts` to English for consistency.
- [ ] **Unified Timer Architecture**: Refactor `useTimer` to consume the synchronized 'now' from `useClock` instead of maintaining its own internal `setInterval` calls. This will eliminate duplicate 'tick' logic and ensure a single source of truth for all time-based calculations across the application.
