# Project Backlog

This file tracks all ideas, requested improvements, and roadmap items for future implementation.

## Priority Improvements (Current Focus)
- [ ] **Arrival Clock Z-index Bug**: The Arrival Clock remains visible and unblurred when modals (Save Routine) or the side library are open. This is due to the sticky header having a higher z-index than the backdrop.
- [ ] **UI Color Palette Refinement**:
    - **Softer Overtime Color**: Replace the heavy amber color with a more pleasant, less "alarming" tone to maintain the app's positive coaching vibe.
    - ~~**Neutral Paused State**: Use a neutral color (e.g., gray) for the active task when it is paused, as pausing is often a neutral/intentional decision.~~ *(Done — [UI Color Palette Refinement](./archive/color_palette_20260303/))*
    - ~~**Neutral Idle State**: Ensure tasks that haven't been started yet (Pending) use neutral colors. Currently, the play button uses blue even when not running, which is confusing.~~ *(Done — [UI Color Palette Refinement](./archive/color_palette_20260303/))*
- [ ] **Minutes Input Bug**: On desktop, the minutes input shows spin buttons (up/down arrows) that obscure the number inside. Hide these buttons via CSS for a cleaner, consistent UI.
- [x] **Sticky Arrival Time**: The Arrival Time display should remain fixed/sticky at the top of the screen when scrolling through a long list of tasks. *(Done — [Sticky Arrival Time](./archive/sticky_arrival_20260222/))*
- [ ] **Arrival Status Icons**: 
    - Replace or augment the "drifting" text with meaningful icons next to the Arrival Clock.
    - **GPS Pin**: Show a static Map/GPS Pin when the timer is running, indicating the arrival time is "locked" or "guaranteed" based on current progress.
    - **Rotating Clock**: Show an animated/rotating clock icon when the timer is paused or in overtime, indicating the arrival time is "drifting" forward in real-time.
- [x] **Task Input Order**: New tasks should be added to the bottom of the list to reduce visual clutter and maintain natural chronological order.
- [x] **Play Icon Alignment**: Center the play icon within its circular button/container in `TaskItem`.
- [x] **Task/Active Merge**: Simplify the UI by transforming the task item itself into the "Active Task" view when played, instead of showing a separate box at the top.
- [x] **Site Metadata**: Update the site title in `index.html` from "temp-project" to "Done-At Timer".

- [ ] **Notification Bell Placement**: The `NotificationBell` component sits permanently in the top-right corner of the app header. Consider replacing it with a one-time banner/prompt that asks for notification permission on first use, then disappears — freeing up header space. The bell is functional (toggles permission) but always-visible UI for a one-time action feels like wasted space.

## Future Roadmap (from Product Definition)
- [ ] **Full Card Drag and Drop** _(priority rising)_: Allow users to drag tasks by clicking anywhere on the card, not just the handle. This would save horizontal space by removing the handle icon. Careful implementation is needed to avoid conflicts with interactive elements like text inputs and buttons. **Visual inconsistency**: the drag handle (two horizontal lines) only renders for PENDING tasks — it disappears when a task is active or completed, leaving an empty spacer `div`. This creates an inconsistent look across task states. Removing the handle entirely and making the whole card draggable resolves both the UX and consistency issues.
- [x] **Intermediate Arrival Times**: Display the estimated completion time for each individual task in the list, allowing users to see not just when they'll finish everything, but when they'll finish each step. *(Done — [Intermediate Arrival Times](./archive/intermediate_etas_20260303/))*
- [ ] **Media Style Notifications**: Instead of just simple complete notifications, use the Media Session API (or advanced PWA notifications) to show current task progress and provide play/pause controls, similar to music player notifications.
- [ ] **Paused Time Tracking**: Measure the time spent in paused state and represent it with a distinct color in the progress bar to show "drift".
- [ ] **Actual vs Estimated Comparison**: When a task is finished, display the actual duration. Show the original estimated time next to it with a strikethrough for easy comparison.
- [ ] **Mini Time Timers**: Add visual "time timers" (circular progress indicators) to represent remaining time for individual tasks and the total session.
- [ ] **Routine List Expansion**: Clicking a routine in the list expands it to show a preview with its task list and buttons to load or delete.
- [ ] **Dark Mode**: Implementation of a dark theme with a manual toggle for user preference.
- [ ] **Unified Animations**: Integrate an animation library (e.g., Framer Motion) to handle all entry/exit transitions for menus and modals.
- [ ] **Quick Complete**: Add a button to tasks in the list to mark them as completed even if they haven't been started.
- [ ] **Swipe to Delete**: Implement a mobile-friendly "swipe to the side" gesture to delete tasks from the list.
- [x] **Inline Editing**: Allow users to edit task names and durations by simply clicking on them in the list. *(Done — [Inline Editing](./archive/inline_editing_20260221/))*
- [x] **Drag & Drop Reordering**: Enable drag-and-drop functionality to easily reorder tasks in the list. *(Done — [Task Reordering](./archive/task_reordering_20260221/))*
- [x] **Completion Checkpoint**: Manual confirmation when a task timer ends. *(Done — [Manual Task Completion Confirmation](./archive/task_completion_confirmation_20240321/))*
    - ~~Add an optional confirmation step when a task timer ends ("Did you actually finish?").~~
    - [ ] Include a toggle setting to enable/disable this manual confirmation (auto-advance vs. manual advance).
- [ ] **Automated Visual Documentation**: 
    - Implement a script (e.g., using Puppeteer or Playwright) to automatically generate screenshots of the application in different states (Active, Paused, Completed, Reordering).
    - Integrate these assets into a revitalized `README.md` and a new `FEATURES.md` to ensure the visual documentation stays in sync with UI changes without manual effort.
- [ ] **Refined Animations**: Change the "pulse" animation on progress bars to a "shimmer/wave" effect (left-to-right) to better convey forward momentum.

## Ideas (Needs Refinement)
- [ ] **Routine Chaining**: Allow users to queue multiple routines in sequence, each with its own set of tasks and its own Arrival Time. Today, the app shows a single arrival time for all tasks combined. With chaining, the user could load e.g. "Morning Routine" followed by "Study Session" followed by "Evening Prep", and the app would show the arrival time for the *current* routine — not the total. As the user scrolls past the completed/current routine's tasks, the next routine's tasks and arrival time come into view naturally.
    - **Core motivation**: Users plan their day in blocks (breakfast, study, leisure). They care most about "will I finish *this* block on time to start the next one?" — not "when does my entire day end?"
    - **Key design constraints** (must be resolved before implementation):
        - **Simplicity first**: The interface must stay clean and intuitive. The whole point of the app is reducing mental load — adding visible complexity defeats the purpose.
        - **Arrival Time clarity**: Each routine needs its own arrival time, but showing multiple timers simultaneously could be confusing. One idea: the main/sticky Arrival Clock always reflects the *current* routine only. Other routines' arrival times are visible only when scrolled into view.
        - **Visual separation**: Clear boundaries between routine blocks in the task list (headers, dividers, color coding?) so users always know which routine they're in.
        - **Transition behavior**: What happens when one routine finishes? Auto-advance to the next? Show a checkpoint? This ties into the existing "Completion Checkpoint" backlog item.
        - **Interaction with existing features**: How does this affect routine saving/loading from the library? Does each routine remain independently saveable?
    - **Status**: Idea stage — needs dedicated design discussion before any spec or implementation work.
- [ ] **Routine Edit-in-Place**: Currently, loading a routine and making changes then saving creates a *new* routine instead of updating the original. This feels unintuitive — users expect "load → edit → save" to update the same routine, not duplicate it.
    - **Core idea**: When a routine is loaded, the app maintains a link to its original ID. Edits (add/remove/reorder tasks, rename, change durations) stay associated with that routine, and saving updates it in place.
    - **Open design questions**:
        - **Auto-save vs. explicit save**: Should edits persist automatically back to the routine (like a Google Doc), or should the user explicitly hit "Save" to update? Auto-save is lower friction but riskier if the user is just experimenting. Explicit save is safer but adds a step.
        - **Creating from scratch**: If the app defaults to "you're always editing a routine", how does the user start a fresh/blank task list not linked to any routine? Need a clear "New Routine" or "Clear" flow.
        - **"Save As" / forking**: The user may want to load "Morning Routine", tweak it, and save it as "Weekend Morning" without overwriting the original. Need both "Save" (update) and "Save As New" options.
        - **Visual indicator**: The user should always know whether they're working on a saved routine (and which one) or on an unsaved/new list. A subtle label or header showing the routine name could help.
        - **Dirty state**: If the user has unsaved changes and tries to load a different routine or clear the list, should there be a confirmation prompt?
    - **Status**: Idea stage — needs design discussion to map out all user scenarios before implementation.

## Technical Debt
- [ ] **Per-task Progress Persistence**: Move the elapsed time tracking from the global `totalElapsedBeforePause` state into the `Task` type itself (e.g., `task.elapsedSeconds`). This ensures that partially completed tasks preserve their progress when the active task is switched or when they are moved back to pending, preventing them from "restarting" from zero when resumed. *Implementar junto com um botão "Reset Progress" na UI — uma vez que `elapsedSeconds` vive na tarefa, resetar é trivial (`task.elapsedSeconds = 0`).*
- [ ] **Code Comments**: Translate Portuguese comments in `src/hooks/useTimer.ts` to English for consistency.
- [ ] **Unified Timer Architecture**: Refactor `useTimer` to consume the synchronized 'now' from `useClock` instead of maintaining its own internal `setInterval` calls. This will eliminate duplicate 'tick' logic and ensure a single source of truth for all time-based calculations across the application.
