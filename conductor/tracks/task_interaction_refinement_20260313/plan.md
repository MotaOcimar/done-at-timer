# Implementation Plan: Task Interaction Refinement & Cleanup

## Technical Context
- **DnD library**: `@dnd-kit` (core v6.3.1, sortable v10.0.0) — configured in `TaskList.tsx`
- **Animation library**: `framer-motion` v12.34.5 — already installed, used for layout animations
- **Drag handle icon**: `GripHorizontal` from `lucide-react` — in `TaskCard.tsx` (line 10, rendered at line 200)
- **Drag handle spacer**: Empty `<div className="w-5 flex-shrink-0" />` renders for active/completed tasks in place of the handle (`TaskCard.tsx` line 203) — must also be removed
- **Inline delete button**: `Trash2` icon in `TaskCard.tsx` (line 267, rendered only for non-active tasks)
- **DnD hook**: `useSortable` is in `TaskItem.tsx` (line 6), which passes `listeners` as props to `TaskCard.tsx`
- **DnD listeners placement**: Currently applied to the drag handle div only (`TaskCard.tsx` lines 194-195), not the card container
- **Interactive elements on card**: `InlineEdit` (title, duration), `StatusIcon` (Play/Pause), `Done` button, `Trash2` button — all must remain clickable when listeners move to card container
- **Sensor config**: `MouseSensor` with `distance: 10`, `TouchSensor` with `delay: 250ms / tolerance: 5` (`TaskList.tsx` lines 45-55)
- **Store action**: `removeTask(id)` in `useTaskStore` (not `deleteTask`)
- **Swipe scope**: All tasks except completed (pending, paused, and active)

## Gesture & Interaction Conflict Resolution Strategy
Three interaction layers share the card surface. Resolution order (highest priority first):

1. **Interactive elements** — Clicks/taps on `InlineEdit` inputs, Play/Pause, Done, and other buttons are handled normally. **All interactive elements must call `e.stopPropagation()` on `onPointerDown`** (not just `onClick`) to prevent dnd-kit sensors and the swipe layer from activating. dnd-kit detects drag initiation via `pointerdown`, so `onClick` stopPropagation alone is insufficient.
2. **Swipe-to-delete** — immediate, no hold delay. Right-to-left horizontal drag on the card surface triggers swipe reveal. Safe because it only reveals a confirmation button. Not available on completed tasks.
3. **Drag-to-reorder** — requires a hold delay (via dnd-kit `TouchSensor` delay / `MouseSensor` distance). After hold threshold is met, any direction **except right-to-left** initiates reorder.
4. **Right-to-left always wins** — regardless of hold state, a right-to-left gesture is always swipe-to-delete, never reorder.

### Implementation approach
- **Swipe logic extraction (SRP)**: Swipe gesture state and logic live in a dedicated `useSwipeToReveal` hook — not inline in `TaskItem.tsx`. This is an **architectural decision** (Single Responsibility), not just a testing convenience. `TaskItem` already manages DnD, timer, and task lifecycle; adding swipe gesture handling directly would overload it. The hook encapsulates `isRevealed`, `dismiss()`, drag callbacks, and framer-motion coordination. `TaskItem` composes the hook without knowing gesture implementation details.
- **Swipe layer**: The hook drives a `framer-motion` `drag="x"` wrapper (constrained to horizontal only via `dragConstraints`) that sits inside the dnd-kit sortable container. The nesting order matters — dnd-kit controls list position, framer-motion controls only the horizontal swipe offset:
    ```
    <div ref={setNodeRef} style={dndTransform}>   ← dnd-kit sortable (position in list)
      <motion.div drag="x" ...>                   ← framer-motion swipe (horizontal offset)
        <TaskCard />
      </motion.div>
    </div>
    ```
  This separation ensures the two transform systems do not conflict. Note: this couples `TaskItem` to framer-motion's API — acceptable since framer-motion is already a project dependency and the coupling is localized (only `TaskItem` + `useSwipeToReveal` would need to change if the library were ever swapped).
- **Direction detection**: Direction is **not** known at `pointerdown` time — it is only determined after the pointer moves. Therefore, the swipe layer must **not** call `stopPropagation()` on `pointerdown`. Instead, the approach is:
    1. Let `pointerdown` propagate normally (both framer-motion and dnd-kit receive it).
    2. On the first `pointermove`, determine gesture direction from the delta.
    3. If the direction is right-to-left: the framer-motion drag layer claims the gesture (its `drag="x"` constraint naturally handles this). To prevent dnd-kit from also activating, the swipe layer sets a `isSwipeActive` ref that `useSortable` reads via its `disabled` option. Since framer-motion reacts immediately but dnd-kit waits for `distance: 10px` / `delay: 250ms`, the ref is set before dnd-kit's sensor activates.
    4. If the direction is not right-to-left: let dnd-kit handle it normally (framer-motion's drag constraint will not engage for vertical/left-to-right movement beyond the snap threshold).
- **Swipe state coordination (props)**: `TaskList` owns an `activeSwipeId` state and passes `activeSwipeId` + `onSwipeDismissAll` as props to each `TaskItem`. When a dnd-kit drag starts (`onDragStart` in `TaskList.tsx`), it calls `onSwipeDismissAll()` to reset all revealed cards. This is only 1 level of prop passing (TaskList → TaskItem) — a React Context would be overhead for this depth.
- **DnD layer**: Keep `@dnd-kit` `useSortable` in `TaskItem.tsx`. Apply `listeners` and `attributes` to the card's outer container. The existing `MouseSensor` distance constraint (10px) and `TouchSensor` delay (250ms) provide natural hold-to-drag behavior.
- **Interactive elements**: All interactive children (Done button, StatusIcon/Play/Pause button, InlineEdit inputs) must call `e.stopPropagation()` on **`onPointerDown`** — not just `onClick`. dnd-kit sensors listen on `pointerdown`; stopping only `click` propagation will not prevent drag initiation. For `InlineEdit`, `onPointerDown` stopPropagation also prevents drag during text selection.

## Phase 1: Reordering & Cleanup
Focus on removing the drag handles and enabling whole-card dragging while preserving interactive element functionality.

- [x] Task: Write failing tests for Phase 1 (TDD Red) 9f7ff3f
    - [x] Update `TaskCard.test.tsx` — add tests asserting drag handle (`GripHorizontal`) icon and spacer div are **absent** from rendered output (these will fail against current code = Red).
    - [x] Add test: a non-completed task card has the `aria-roledescription="sortable"` attribute (or equivalent), confirming it is draggable — test observable behavior, not internal `listeners`/`attributes` wiring.
    - [x] Add test: clicking the Play/Pause button fires its handler and `onPointerDown` calls `stopPropagation()`.
    - [x] Add test: clicking the Done button fires its handler and `onPointerDown` calls `stopPropagation()`.
    - [x] Add test: clicking/focusing an InlineEdit input allows normal interaction and `onPointerDown` calls `stopPropagation()` (test in `InlineEdit.test.tsx` since the fix lives in the shared component).
    - [x] Add test: a completed task card does **not** have `aria-roledescription="sortable"` (it is not draggable).
    - [x] Run tests, confirm they fail (Red phase).
- [x] Task: Remove `GripHorizontal` drag handle and spacer from `TaskCard.tsx` (TDD Green) 9f7ff3f
    - [x] Remove the `GripHorizontal` import and icon rendering (line 200).
    - [x] Remove the empty spacer `<div className="w-5 flex-shrink-0" />` that renders for active/completed tasks (line 203).
    - [x] Remove the entire conditional block (lines 192-204) wrapping handle + spacer.
    - [x] Update CSS/Tailwind to reclaim the horizontal space previously occupied by the handle column.
- [x] Task: Move dnd-kit ownership from TaskCard to TaskItem (TDD Green) 9f7ff3f
    - [x] `TaskItem` creates an outer wrapper `<div ref={setNodeRef} style={dndStyle} {...attributes} {...listeners}>` around `TaskCard`. Set `touch-action: pan-y` on this wrapper (allows vertical scroll, captures horizontal gestures).
    - [x] Remove `setNodeRef`, `style`, `attributes`, `listeners` from `TaskCardProps` — TaskCard becomes a pure presentational component for dnd concerns.
    - [x] Do **not** apply `listeners`/`attributes` on completed task cards — pass `disabled: true` to `useSortable` for completed tasks.
    - [x] This restructuring prepares for Phase 2, where a swipe `motion.div` wrapper is inserted between the dnd-kit container and TaskCard.
- [x] Task: Add `onPointerDown` stopPropagation to all interactive elements (TDD Green) 9f7ff3f
    - [x] **`InlineEdit.tsx`** (shared component): add `onPointerDown={(e) => e.stopPropagation()}` to both the editing `<input>` (line 78) and the display `<span>` (line 97). The fix belongs inside InlineEdit itself, not in TaskCard wrappers.
    - [x] **`TaskCard.tsx` StatusIcon buttons**: add `onPointerDown={(e) => e.stopPropagation()}` to the Play/Pause button (line 83) and the idle Play button (line 100).
    - [x] **`TaskCard.tsx` Done button** (line 249): add `onPointerDown` with `e.stopPropagation()` (currently only `onClick` stops propagation).
    - [x] `onClick` stopPropagation alone is insufficient — dnd-kit sensors activate on `pointerdown`.
    - [x] Run tests, confirm they pass (Green phase).
- [x] Task: Refactor Phase 1 (TDD Refactor) 9f7ff3f
    - [x] Review implementation and test code for duplication and clarity.
    - [x] Ensure reordering tests in `TaskList.test.tsx` still pass with whole-card dragging.
    - [x] Run full test suite, confirm all tests pass.
- [x] Task: Phase 1 Review Cleanup be3a631
    - [x] Remove dead imports in `TaskCard.tsx`: `GripHorizontal` (lucide-react), `DraggableAttributes` and `DraggableSyntheticListeners` (`@dnd-kit/core`) — no longer used after DnD ownership moved to `TaskItem`.
    - [x] Remove redundant tests in `TaskCard.test.tsx`: `"hides drag handle for active tasks"` (line 280) and `"hides drag handle for completed tasks"` (line 296) — already covered more thoroughly by the Phase 1 test `"does not render GripHorizontal icon or spacer div for any task"` (line 313).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Reordering & Cleanup' (Protocol in workflow.md) 9f7ff3f

## Phase 2: Swipe-to-Delete Implementation
Introduce the swipe-to-delete gesture and the "Delete" button revealed behind the card. Swipe is available on all tasks **except completed**.

- [x] Task: Spike — design `useSwipeToReveal` hook and validate test strategy 6d7fd21
    - [ ] The `useSwipeToReveal` hook is an architectural decision (see Implementation Approach above). This spike defines its API and validates how to test it. Draft the hook's public interface: inputs (task id, enabled flag, dismiss signal) and outputs (`isRevealed`, `dismiss()`, framer-motion drag props).
    - [ ] `framer-motion` drag gestures are difficult to simulate with `fireEvent` in happy-dom/jsdom (no real pointer event sequences or animation frames). Investigate and decide on one of these test strategies:
        1. **Test the hook in isolation** with `renderHook` (state transitions, dismiss logic). Test the component with the hook mocked — verify conditional rendering of the Delete button based on `isRevealed` state.
        2. **Mock `framer-motion`'s `motion.div`** to a plain `div` that exposes `onDragEnd` as a callable prop, then invoke it directly in tests with synthetic drag info.
        3. **Use `@testing-library/user-event`** with pointer event sequences if the environment supports it.
    - [ ] Write a small proof-of-concept test using the chosen strategy. Confirm it can: (a) trigger a swipe reveal, (b) verify the Delete button appears, (c) dismiss the reveal.
    - [ ] Document the hook API and chosen test strategy in this task's commit note so Phase 2 follows consistently.
- [ ] Task: Write failing tests for Phase 2 (TDD Red)
    - [ ] Using the strategy validated in the spike, test that right-to-left swipe on a non-completed task reveals a "Delete" button.
    - [ ] Test that clicking the revealed Delete button calls `removeTask`.
    - [ ] Test that completed tasks do not have swipe-to-delete (no Delete button rendered, swipe has no effect).
    - [ ] Test that the inline Trash2 delete button no longer exists in `TaskCard`.
    - [ ] Test that dismissing the swipe (left-to-right or tap) hides the Delete button.
    - [ ] Test keyboard delete fallback (`Delete` key on focused card removes task).
    - [ ] Test swipe state reset: when a drag-to-reorder starts, all revealed swipe areas dismiss.
    - [ ] Test active task deletion: deleting an active task (via revealed Delete button) stops the timer and auto-advances to the next pending task.
    - [ ] Run tests, confirm they fail (Red phase).
- [ ] Task: Implement `useSwipeToReveal` hook (TDD Green)
    - [ ] Create `src/hooks/useSwipeToReveal.ts` with the API designed in the spike. The hook manages all swipe state and framer-motion drag props internally.
    - [ ] Hook inputs: task id, enabled flag (false for completed tasks), `activeSwipeId` and `onSwipeDismissAll` (props from `TaskList` for coordination).
    - [ ] Hook outputs: `isRevealed`, `isSwipeActive` (ref for disabling dnd-kit), `dismiss()`, framer-motion drag props (`drag`, `dragConstraints`, `onDragEnd`, `animate`, etc.).
    - [ ] Constrain drag: only allow right-to-left (negative x), clamp to reveal width (e.g., `-80px`).
    - [ ] Implement "Reveal & Stay" logic: right-to-left swipe past threshold (e.g., 40px) snaps to reveal position via `dragSnapToOrigin: false` + `onDragEnd` with `animate`.
    - [ ] Implement dismiss: left-to-right swipe (or tap card) snaps back to `x: 0`. Auto-dismiss when `activeSwipeId` changes to another task's id.
    - [ ] Intercept right-to-left gestures: direction is unknown at `pointerdown` time. Use framer-motion's `onDragStart`/`onDrag` callbacks to detect right-to-left direction from the drag offset. When the swipe layer claims the gesture, set an `isSwipeActive` ref — `TaskItem` passes this ref's value to `useSortable({ disabled: isSwipeActive })` so dnd-kit does not activate. Since framer-motion reacts immediately but dnd-kit waits for its sensor threshold (`distance: 10px` / `delay: 250ms`), the flag is set before dnd-kit tries to start.
- [ ] Task: Integrate swipe layer in `TaskItem.tsx` and `TaskList.tsx` (TDD Green)
    - [ ] `TaskItem`: consume `useSwipeToReveal`, insert a `motion.div` wrapper between the existing dnd-kit container (from Phase 1) and `TaskCard`. Pass the hook's `isSwipeActive` ref to `useSortable({ disabled })` to prevent dnd-kit from activating during swipe. Pass `activeSwipeId` and `onSwipeDismissAll` from props.
    - [ ] `TaskList`: add `activeSwipeId` state. Pass it + setter to each `TaskItem`. In `onDragStart`, call dismiss-all before proceeding with reorder. Dismiss must be **instant** (no transition animation) to avoid visual distraction during drag initiation.
- [ ] Task: Create "Reveal Behind" area with Delete button (TDD Green)
    - [ ] Add a positioned layer (absolute, right-aligned) behind the task card containing a red "Delete" button.
    - [ ] Ensure the button is only visible/clickable when the card is swiped open (`overflow: hidden` on the container, or conditional rendering based on swipe state).
    - [ ] Delete button must meet min 44x44px touch target.
- [ ] Task: Remove existing inline delete button from `TaskCard.tsx` (TDD Green)
    - [ ] Remove the `Trash2` import (if no longer used elsewhere) and button rendering.
    - [ ] Remove the associated `onDelete` prop from `TaskCardProps` if it's no longer needed (the delete action moves to the reveal layer in `TaskItem.tsx`).
- [ ] Task: Connect revealed Delete button to `removeTask` in `useTaskStore` (TDD Green)
    - [ ] Wire the onClick of the revealed Delete button to call `removeTask(id)`.
    - [ ] `TaskItem.tsx` already receives `onDelete` prop — reuse it for the revealed button.
- [ ] Task: Add keyboard accessibility fallback for delete (TDD Green)
    - [ ] Allow `Delete` key to trigger task removal when the card container itself is focused (add `onKeyDown` handler to card container). **Guard**: only act when `e.target === e.currentTarget` — this prevents the `Delete` key from removing the task when the user is editing text inside an `InlineEdit` input.
    - [ ] Ensure screen readers can discover the delete action (e.g., `aria-label` on the card or a visually hidden button).
    - [ ] Run tests, confirm they pass (Green phase).
- [ ] Task: Refactor Phase 2 (TDD Refactor)
    - [ ] Review swipe implementation and test code for duplication and clarity.
    - [ ] Run full test suite, confirm all tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Swipe-to-Delete Implementation' (Protocol in workflow.md)

## Phase 3: Polish & Mobile Verification
Refine the feel of interactions and verify they work well across devices. Animation tuning is aesthetic (no tests needed), but haptic feedback is new functionality and follows TDD.

- [ ] Task: Tune swipe animation parameters
    - [ ] Adjust `framer-motion` spring/tween config for the swipe reveal: test damping, stiffness, and duration to ensure the snap feels responsive but not jarring.
    - [ ] Add elastic resistance when dragging beyond the reveal position (rubberband effect) so the user feels the boundary.
    - [ ] Ensure the dismiss animation (snap back to `x: 0`) is quick and smooth (~200ms).
- [ ] Task: Add haptic feedback on swipe reveal (TDD)
    - [ ] **Red**: Write failing tests:
        - Test that `triggerHaptic` (from `src/utils/haptics.ts`) is called when the swipe crosses the reveal threshold (mock the module via `vi.mock`).
        - Test `triggerHaptic` unit: calls `navigator.vibrate(10)` when available, no-ops without error when unavailable.
    - [ ] **Green**: Implement:
        - Create `src/utils/haptics.ts` with a `triggerHaptic(ms = 10)` wrapper that gates behind `'vibrate' in navigator`. This keeps the browser API behind a mockable module boundary (DIP-lite) without over-engineering an interface.
        - Call `triggerHaptic()` from `useSwipeToReveal` when the swipe crosses the reveal threshold.
    - [ ] **Limitation**: Vibration API is not supported on iOS Safari and has inconsistent support across browsers.
- [ ] Task: Verify mobile touch targets and responsiveness
    - [ ] Confirm the revealed Delete button meets 44x44px minimum on mobile viewports.
    - [ ] Test that swipe and drag-to-reorder don't conflict on touch devices (especially the 250ms hold delay).
    - [ ] Test on small screens (320px width) — ensure the revealed Delete area doesn't overflow or clip the card content.
    - [ ] Verify that scrolling the task list vertically is not accidentally intercepted by swipe gestures.
- [ ] Task: Run full test suite regression check
    - [ ] Run `CI=true npm test` and confirm all Phase 1 and Phase 2 tests still pass after animation tuning.
    - [ ] Verify no regressions were introduced by animation parameter changes.
- [ ] Task: Update backlog — mark "Full Card Drag and Drop" and "Swipe to Delete" as done, referencing this track
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Polish & Mobile Verification' (Protocol in workflow.md)
