# Project Backlog

This file tracks all ideas, requested improvements, and roadmap items for future implementation.

## Priority Improvements (Current Focus)
- [x] **Task Input Order**: New tasks should be added to the bottom of the list to reduce visual clutter and maintain natural chronological order.
- [x] **Play Icon Alignment**: Center the play icon within its circular button/container in `TaskItem`.
- [x] **Task/Active Merge**: Simplify the UI by transforming the task item itself into the "Active Task" view when played, instead of showing a separate box at the top.
- [x] **Site Metadata**: Update the site title in `index.html` from "temp-project" to "Done-At Timer".

## Future Roadmap (from Product Definition)
- [ ] **Dark Mode**: Implementation of a dark theme with a manual toggle for user preference.
- [ ] **Unified Animations**: Integrate an animation library (e.g., Framer Motion) to handle all entry/exit transitions for menus and modals.
- [ ] **Quick Complete**: Add a button to tasks in the list to mark them as completed even if they haven't been started.
- [ ] **Swipe to Delete**: Implement a mobile-friendly "swipe to the side" gesture to delete tasks from the list.
- [ ] **Inline Editing**: Allow users to edit task names and durations by simply clicking on them in the list.
- [ ] **Drag & Drop Reordering**: Enable drag-and-drop functionality to easily reorder tasks in the list.
- [ ] **Completion Checkpoint**:
    - Add an optional confirmation step when a task timer ends ("Did you actually finish?").
    - Include a toggle setting to enable/disable this manual confirmation (auto-advance vs. manual advance).
- [ ] **Refined Animations**: Change the "pulse" animation on progress bars to a "shimmer/wave" effect (left-to-right) to better convey forward momentum.

## Technical Debt
- [ ] **Code Comments**: Translate Portuguese comments in `src/hooks/useTimer.ts` to English for consistency.
- [ ] **Cleanup**: Remove unused `elapsedSeconds` variable in `src/store/useTaskStore.ts` inside the `pauseTask` action.
