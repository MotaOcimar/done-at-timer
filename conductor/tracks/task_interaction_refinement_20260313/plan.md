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
    3. If the direction is right-to-left: the framer-motion drag layer claims the gesture (its `drag="x"` constraint naturally handles this). To prevent dnd-kit from also activating, the swipe layer sets a `isSwipeActive` ref that `useSortable` reads via its `disabled` option. Since framer-motion reacts immediately but dnd-kit waits for `distance: 10px` / `delay: 250ms`, the flag is set before dnd-kit's sensor activates.
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

## Phase 2: Swipe-to-Delete Implementation [checkpoint: b21e106]
Introduce the swipe-to-delete gesture and the "Delete" button revealed behind the card. Swipe is available on all tasks **except completed**.

- [x] Task: Spike — design `useSwipeToReveal` hook and validate test strategy 6d7fd21
    - [x] The `useSwipeToReveal` hook is an architectural decision (see Implementation Approach above). This spike defines its API and validates how to test it. Draft the hook's public interface: inputs (task id, enabled flag, dismiss signal) and outputs (`isRevealed`, `dismiss()`, framer-motion drag props).
    - [x] `framer-motion` drag gestures are difficult to simulate with `fireEvent` in happy-dom/jsdom (no real pointer event sequences or animation frames). Investigate and decide on one of these test strategies:
        1. **Test the hook in isolation** with `renderHook` (state transitions, dismiss logic). Test the component with the hook mocked — verify conditional rendering of the Delete button based on `isRevealed` state.
        2. **Mock `framer-motion`'s `motion.div`** to a plain `div` that exposes `onDragEnd` as a callable prop, then invoke it directly in tests with synthetic drag info.
        3. **Use `@testing-library/user-event`** with pointer event sequences if the environment supports it.
    - [x] Write a small proof-of-concept test using the chosen strategy. Confirm it can: (a) trigger a swipe reveal, (b) verify the Delete button appears, (c) dismiss the reveal.
    - [x] Document the hook API and chosen test strategy in this task's commit note so Phase 2 follows consistently.
- [x] Task: Write failing tests for Phase 2 (TDD Red) 48fafbd
    - [x] Using the strategy validated in the spike, test that right-to-left swipe on a non-completed task reveals a "Delete" button.
    - [x] Test that clicking the revealed Delete button calls `removeTask`.
    - [x] Test that completed tasks do not have swipe-to-delete (no Delete button rendered, swipe has no effect).
    - [x] Test that the inline Trash2 delete button no longer exists in `TaskCard`.
    - [x] Test that dismissing the swipe (left-to-right or tap) hides the Delete button.
    - [x] Test keyboard delete fallback (`Delete` key on focused card removes task).
    - [x] Test swipe state reset: when a drag-to-reorder starts, all revealed swipe areas dismiss.
    - [x] Test active task deletion: deleting an active task (via revealed Delete button) stops the timer and auto-advances to the next pending task.
    - [x] Run tests, confirm they fail (Red phase).
- [x] Task: Implement `useSwipeToReveal` hook (TDD Green) 6d7fd21
    - [x] Create `src/hooks/useSwipeToReveal.ts` with the API designed in the spike. The hook manages all swipe state and framer-motion drag props internally.
    - [x] Hook inputs: task id, enabled flag (false for completed tasks), `activeSwipeId` and `onSwipeDismissAll` (props from `TaskList` for coordination).
    - [x] Hook outputs: `isRevealed`, `isSwipeActive` (ref for disabling dnd-kit), `dismiss()`, framer-motion drag props (`drag`, `dragConstraints`, `onDragEnd`, `animate`, etc.).
    - [x] Constrain drag: only allow right-to-left (negative x), clamp to reveal width (e.g., `-80px`).
    - [x] Implement "Reveal & Stay" logic: right-to-left swipe past threshold (e.g., 40px) snaps to reveal position via `dragSnapToOrigin: false` + `onDragEnd` with `animate`.
    - [x] Implement dismiss: left-to-right swipe (or tap card) snaps back to `x: 0`. Auto-dismiss when `activeSwipeId` changes to another task's id.
    - [x] Intercept right-to-left gestures: direction is unknown at `pointerdown` time. Use framer-motion's `onDragStart`/`onDrag` callbacks to detect right-to-left direction from the drag offset. When the swipe layer claims the gesture, set an `isSwipeActive` ref — `TaskItem` passes this ref's value to `useSortable({ disabled: isSwipeActive })` so dnd-kit does not activate. Since framer-motion reacts immediately but dnd-kit waits for its sensor threshold (`distance: 10px` / `delay: 250ms`), the flag is set before dnd-kit tries to start.
- [x] Task: Integrate swipe layer in `TaskItem.tsx` and `TaskList.tsx` (TDD Green) e16473c
    - [x] `TaskItem`: consume `useSwipeToReveal`, insert a `motion.div` wrapper between the existing dnd-kit container (from Phase 1) and `TaskCard`. Pass the hook's `isSwipeActive` ref to `useSortable({ disabled })` to prevent dnd-kit from activating during swipe. Pass `activeSwipeId` and `onSwipeDismissAll` from props.
    - [x] `TaskList`: add `activeSwipeId` state. Pass it + setter to each `TaskItem`. In `onDragStart`, call dismiss-all before proceeding with reorder. Dismiss must be **instant** (no transition animation) to avoid visual distraction during drag initiation.
- [x] Task: Create "Reveal Behind" area with Delete button (TDD Green) e16473c
    - [x] Add a positioned layer (absolute, right-aligned) behind the task card containing a red "Delete" button.
    - [x] Ensure the button is only visible/clickable when the card is swiped open (`overflow: hidden` on the container, or conditional rendering based on swipe state).
    - [x] Delete button must meet min 44x44px touch target.
- [x] Task: Remove existing inline delete button from `TaskCard.tsx` (TDD Green) e16473c
    - [x] Remove the `Trash2` import (if no longer used elsewhere) and button rendering.
    - [x] Remove the associated `onDelete` prop from `TaskCardProps` if it's no longer needed (the delete action moves to the reveal layer in `TaskItem.tsx`).
- [x] Task: Connect revealed Delete button to `removeTask` in `useTaskStore` (TDD Green) e16473c
    - [x] Wire the onClick of the revealed Delete button to call `removeTask(id)`.
    - [x] `TaskItem.tsx` already receives `onDelete` prop — reuse it for the revealed button.
- [x] Task: Add keyboard accessibility fallback for delete (TDD Green) e16473c
    - [x] Allow `Delete` key to trigger task removal when the card container itself is focused (add `onKeyDown` handler to card container). **Guard**: only act when `e.target === e.currentTarget` — this prevents the `Delete` key from removing the task when the user is editing text inside an `InlineEdit` input.
    - [x] Ensure screen readers can discover the delete action (e.g., `aria-label` on the card or a visually hidden button).
    - [x] Run tests, confirm they pass (Green phase).
- [x] Task: Refactor Phase 2 (TDD Refactor) b1bf5c8
    - [x] Review swipe implementation and test code for duplication and clarity.
    - [x] Run full test suite, confirm all tests pass.
- [x] Task: Phase 2 Review Cleanup 4556bca, 07e0b74, 0838638
    - [x] Remove unused `Trash2` import from `TaskCard.tsx` — the inline delete button was removed but the import was left behind. (Note: keep `Trash2` available — it will be reused in the reveal layer below.)
    - [x] Stage and commit `src/components/InlineEdit.test.tsx` — test file was created but never tracked/committed.
    - [x] In `TaskItem.tsx`, move `onManualComplete` definition after the `useTimer` hook call — currently references `timeLeft` before it is defined (works via hoisting but is misleading).
    - [x] Fix revealed Delete button not clickable (partial) — added `onPointerDown` stopPropagation but missed `onTouchStart`. dnd-kit's `MouseSensor` listens on `mousedown`/`pointerdown` and `TouchSensor` listens on `touchstart`. All other interactive elements (Play/Pause, Done, InlineEdit) have **both** `onPointerDown` and `onTouchStart` stopPropagation. The Delete button only has `onPointerDown`, so on touch devices the `touchstart` event still bubbles to the dnd-kit container, where the `TouchSensor` (delay: 250ms) intercepts it.
    - [x] Add `onTouchStart={(e) => e.stopPropagation()}` to the revealed Delete button in `TaskItem.tsx` (line 143), matching the pattern used by all other interactive elements.
    - [x] Replace "Delete" text label with `Trash2` icon in the reveal layer (`TaskItem.tsx`) — matches the original inline delete style. Move the `Trash2` import from `TaskCard.tsx` to `TaskItem.tsx`.
    - [x] Fix completed tasks appearing red — the reveal layer container applies `bg-red-500` unconditionally, bleeding through semi-transparent card backgrounds.
    - [x] Fix dragged tasks appearing red during reorder — `opacity-50` on drag exposes the red container.
    - [x] Consolidate red background fix — the current approach (excluding `bg-red-500` per-case with `!isCompleted && !isDragging`) is fragile; any animation that shifts or fades the card will leak red. Invert the logic: only apply `bg-red-500` when the swipe is active or revealed (`isSwipeActive || isRevealed`). These are the only two states where the red background needs to be visible. This replaces all per-case exclusions with a single positive condition.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Swipe-to-Delete Implementation' (Protocol in workflow.md) 9f7ff3f

## Phase 3: Polish & Mobile Verification
Refine the feel of interactions and verify they work well across devices.

> **Blocks on**: Phase 2 manual verification must be completed first.

- [x] Task: Fix abrupt appearance of red background and trash icon during swipe (TDD) 4116907
    - [x] Investigate root cause and document solution approach
    - [x] **Red**: Write/update failing tests 4116907
    - [x] **Green**: Implement 4116907
    - [x] **Refactor**: Review implementation and test code 4116907
    - [x] Verify (manual): swipe from first pixel → red and icon fade in smoothly (no flash). During drag-to-reorder, red layer is invisible (opacity=0).
- [x] Task: Tune swipe animation parameters (manual tuning — TDD exception) 4116907
    - [x] Implement: 4116907
        - Add `dragElastic: { left: 0.3, right: 0 }` to dragProps (rubberband past reveal boundary, no elasticity right).
        - Set reveal/dismiss transition to `{ type: "tween", duration: 0.2 }`.
    - [x] **Visual tuning**: Adjust spring/tween values (damping, stiffness) until the snap feels responsive. Iterate on device.
- [x] Task: Add haptic feedback on swipe reveal (TDD) 4116907
    - [x] **Red**: Write failing tests 4116907
    - [x] **Green**: Implement 4116907
    - [x] **Refactor**: Review haptic integration 4116907
- [x] Task: Fix swipe-to-delete activating during drag-to-reorder (TDD) 4116907
    - **Bug**: When reordering a task (dnd-kit drag active, `isDragging=true`), moving the finger horizontally causes the red delete background to appear. Root cause: the inner `<motion.div>` keeps `drag="x"` active during dnd-kit drag — framer-motion processes the horizontal component of pointer movement and updates the `x` motion value, which drives `redOpacity`.
    - **Fix**: Override `dragProps.drag` to `false` when `isDragging` is `true` in `TaskItem.tsx`. Note: `layout={isDragging ? false : "position"}` is already applied (line 163) — only the `drag` override is missing:
      ```tsx
      <motion.div
        {...dragProps}
        drag={isDragging ? false : dragProps.drag}
        layout={isDragging ? false : "position"}   // already present
      >
      ```
      This completes the bidirectional conflict resolution: swipe disables dnd-kit (`useSortable({ disabled: isSwipeActive })`), and now dnd-kit disables swipe (`drag={isDragging ? false : ...}`).
    - [x] **Red**: Write failing test — simulate `isDragging=true` and verify that `dragProps.drag` is overridden to `false` (or that the motion.div receives `drag={false}`). 6366eea
    - [x] **Green**: Add the `drag={isDragging ? false : dragProps.drag}` override to the `<motion.div>` in `TaskItem.tsx` line 162 (the `layout` line is already correct). 4116907
    - [x] **Refactor**: Consider adding a code comment explaining the bidirectional guard. 6366eea
    - [x] Run full test suite, confirm no regressions. 6366eea
- [x] Task: Fix card stuck at intermediate position after slow drag release (TDD) 42b0fdd
    - **Bug**: When the user drags a task card slowly to the left, stops before the reveal threshold (40px), and releases, the card stays at the exact release position instead of snapping back to `x: 0`. The card appears "stuck" in a half-revealed state.
    - **Root cause**: `handleDragEnd` calls `setIsRevealed(false)`, but `isRevealed` was **already `false`** — it was never set to `true` during this gesture. React treats `setState(sameValue)` as a no-op: no re-render, no useEffect trigger (line 35-41 `x.set(0)` doesn't fire), and the `animate` prop (`{ x: 0 }`) doesn't change so framer-motion doesn't re-animate. The `x` MotionValue stays at whatever position the drag left it.
    - **Fix — explicitly animate `x` to target in `handleDragEnd`**:
        1. Import `animate` (the imperative animation function) from `framer-motion`.
        2. In `handleDragEnd`, after deciding `shouldReveal`, call `animate(x, target, transition)` directly on the MotionValue instead of relying on the state change → useEffect → `x.set()` chain:
           ```typescript
           if (shouldReveal) {
             setIsRevealed(true);
             animate(x, -revealWidth, { type: "tween", duration: 0.2, ease: "easeOut" });
           } else {
             setIsRevealed(false);
             animate(x, 0, { type: "tween", duration: 0.2, ease: "easeOut" });
           }
           ```
        3. This guarantees the card always snaps to either `0` or `-revealWidth` with a smooth 200ms tween, even when the state value didn't change.
        4. The useEffect at lines 35-41 (`x.set(0)` / `x.set(-revealWidth)`) still handles **programmatic** dismiss (e.g., auto-dismiss when another card's swipe activates). Consider also upgrading it to use `animate()` for consistency, but this is optional.
    - [x] **Red**: Write failing test — simulate drag end below threshold with `isRevealed` already `false`, verify `x` animates back to 0. 42b0fdd
    - [x] **Green**: Import `animate` from framer-motion, update `handleDragEnd` to imperatively animate `x`. **Also remove the declarative `animate` prop from `dragProps` (line 101)** — keeping both the imperative `animate(x, ...)` call and the declarative `animate: { x: ... }` prop creates two conflicting animation sources on the same MotionValue; the imperative call is now the single source of truth for drag-end animations. 42b0fdd
    - [x] **Refactor**: Review useEffect at lines 35-41 for consistency — consider upgrading `x.set()` to `animate()` for smoother programmatic dismiss transitions. 42b0fdd
    - [x] Run full test suite, confirm no regressions. 42b0fdd
- [x] Task: Fix border disappearing on clipped left edge during swipe (TDD) 42b0fdd
    - **Bug**: When swiping a task left, the card's left border exits the visible area (clipped by `overflow: hidden` on the container). The left edge of the visible area has no border, so the task looks visually "cut off" without closure.
    - **Root cause**: The `border` + `border-{color}` classes live on `TaskCard`'s root div (line 175), which moves with the swipe. The clip container (`TaskItem.tsx` line 138, `<div className="relative mb-3 rounded-2xl overflow-hidden">`) has no border — so when the card slides, nothing provides a left-edge border.
    - **Fix — move border ownership from TaskCard to the clip container**:
        1. **Extract `cardState` computation** to a shared utility (e.g. `src/utils/cardState.ts`) to avoid duplicating the state-derivation logic between TaskCard and TaskItem. The function takes `{ isCompleted, isActive, isTimeUp, isActuallyPaused }` and returns the `CardState` enum value.
        2. **Create a border-only class mapping** (separate from `cardClasses`): `Record<CardState, string>` with only the `border-{color}` values (no `bg-*`, no `ring-*`).
        3. **In `TaskItem.tsx`**: compute `cardState` using the shared utility, apply `border` + the state-specific `border-{color}` to the clip container (line 138).
        4. **In `TaskCard.tsx`**: remove `border` and `border-{color}` from `cardClasses` — keep `bg-*` and `ring-*` only. Remove the base `border` class from the card div (line 175).
    - **Result at x=0 (no swipe)**: container border visible on all sides, card has no border → visually identical to today (both share `rounded-2xl`, container clips exactly at card edges).
    - **Result during swipe**: container's left border stays in place → continuous visual closure on the left edge. Right side (red area): also gets the container border, which provides additional visual cohesion.
    - **Note on `ring` classes**: `ring-*` (CSS box-shadow) on TaskCard is also clipped on the left during swipe, but this is a subtle secondary effect. Leave it on TaskCard for now; revisit if it becomes visually noticeable.
    - [x] **Red**: Write failing tests — verify the clip container has state-dependent border classes; verify TaskCard no longer has `border` class. 42b0fdd
    - [x] **Green**: Extract `cardState`, create border mapping, apply to container, remove from TaskCard. 42b0fdd
    - [x] **Refactor**: Review for duplication; ensure `cardClasses` in TaskCard is clean. 42b0fdd
    - [x] Run full test suite, confirm no regressions. 42b0fdd
- [x] Task: Verify mobile touch targets and responsiveness (manual) 42b0fdd
    - Touch target sizing (44×44px) depends on padding + icon size, not specific CSS classes — JSDOM can't compute rendered dimensions. Verified manually only.
    - [x] Delete button has adequate touch target (≥44×44px) on device. 42b0fdd
    - [x] Swipe and drag-to-reorder don't conflict on touch devices (especially the 250ms hold delay). 42b0fdd
    - [x] On small screens (320px width) — revealed Delete area doesn't overflow or clip the card content. 42b0fdd
    - [x] Scrolling the task list vertically is not accidentally intercepted by swipe gestures. 42b0fdd
- [x] Task: Refactor Phase 3 — initial pass (TDD Refactor) 4116907
    - [x] Review all Phase 3 changes holistically — opacity-from-X approach, animation config, haptic integration. 4116907
    - [x] Run full test suite (`CI=true npm test`), confirm all phases pass with no regressions. 4116907
- [x] Task: Refactor Phase 3 — final pass (TDD Refactor) 42b0fdd
    - [x] Review the three bug fix implementations holistically for duplication, naming consistency, and interaction between the fixes. 42b0fdd
    - [x] Run full test suite (`CI=true npm test`), confirm all phases pass with no regressions. 42b0fdd
- [x] Task: Update backlog — mark "Full Card Drag and Drop" and "Swipe to Delete" as done, referencing this track 4116907
- [x] Task: Conductor - User Manual Verification 'Phase 3: Polish & Mobile Verification' (Protocol in workflow.md) 42b0fdd
    - [x] Swipe desde o primeiro pixel → red e ícone aparecem gradualmente (sem flash) 42b0fdd
    - [x] Durante drag-to-reorder, sem vermelho visível — mover o dedo horizontalmente durante reorder não revela o fundo vermelho 42b0fdd
    - [x] Drag-to-reorder com opacity-50 não vaza vermelho 42b0fdd
    - [x] Animação de snap (reveal e dismiss) é fluida (~200ms) 42b0fdd
    - [x] Rubberband: arrastar além do reveal width tem resistência elástica 42b0fdd
    - [x] Haptic feedback funciona em Android/Chrome (vibração curta ao cruzar threshold) 42b0fdd
    - [x] Delete button tem tamanho adequado para toque em mobile (≥44×44px) 42b0fdd
    - [x] Em viewport 320px, reveal area não transborda 42b0fdd
    - [x] Scroll vertical da lista não é interceptado pelo swipe horizontal 42b0fdd
    - [x] Card stuck: arrastar lentamente para a esquerda, parar antes do threshold e soltar → card volta suavemente para x=0 (sem ficar preso em posição intermediária) 42b0fdd
    - [x] Borda contínua: durante swipe, a edge esquerda do card mantém borda visível (sem corte abrupto onde o card sai da área visível) 42b0fdd
    - [x] Completed tasks: sem swipe, sem reveal layer, sem delete button 42b0fdd
- [x] Task: Fix swipe red flash after drag-to-reorder release (TDD) [sha]
    - **Bug**: After reordering a task via dnd-kit drag, the red delete background flashes on release if the finger was offset to the left during the drag.
    - **Root cause**: Between `pointerdown` and dnd-kit's activation threshold (10px mouse / 250ms touch), framer-motion's drag system starts tracking immediately (~3px internal threshold). If the pointer moves left during this window, the `x` MotionValue goes negative. When dnd-kit activates and `drag` flips to `false`, framer-motion stops tracking but does **NOT** fire `onDragEnd` — so `handleDragEnd` never runs and `x` is never animated back to 0. The existing dismiss path also fails: `handleSwipeDismissAll()` (called in `TaskList.handleDragStart`) sets `activeSwipeId` to `null`, but the auto-dismiss effect (line 28-32 of `useSwipeToReveal.ts`) requires `activeSwipeId !== null` — condition is false. And `isRevealed` was never set to `true`, so the isRevealed effect (line 35-38) doesn't fire either. When `isDragging` goes back to `false` after the reorder, `x` still has the stale negative value → `redOpacity > 0` → red flashes.
    - **Fix**: Reset the `x` MotionValue to 0 when `isDragging` becomes `true`. This goes in `TaskItem.tsx` (not the hook) because it coordinates the two gesture systems — same pattern as `drag={isDragging ? false : dragProps.drag}` at line 165. Cannot pass `isDragging` into `useSwipeToReveal` because of circular call order: `useSwipeToReveal` (line 44) is called before `useSortable` (line 56), and `useSortable` depends on `isSwipeActive` from the hook.
    - **Implementation steps**:
        1. In `TaskItem.tsx` line 44-48, add `x` to the destructured return from `useSwipeToReveal`:
            ```tsx
            const {
              isRevealed,
              isSwipeActive,
              x,
              redOpacity,
              dragProps
            } = useSwipeToReveal({ ... });
            ```
        2. After the `useSortable` call (after line 66), add a `useEffect` that resets `x` when dnd-kit drag starts:
            ```tsx
            useEffect(() => {
              if (isDragging) {
                x.set(0);
              }
            }, [isDragging, x]);
            ```
           Use `x.set(0)` (instant), not `animate(x, 0, ...)` — the card is being moved by dnd-kit at this point, so the swipe layer is invisible and no animation is needed.
    - [ ] **Red**: Write failing test in `TaskItem.swipe.test.tsx`:
        - Mock `useSwipeToReveal` to return an `x` object with a `set` spy (e.g., `{ set: vi.fn(), get: () => -30 }`).
        - Mock `useSortable` to return `isDragging: false`. Render. Clear the spy.
        - Re-mock `useSortable` to return `isDragging: true`. Rerender.
        - Assert `x.set` was called with `0`.
    - [ ] **Green**: Implement the two changes in `TaskItem.tsx` (destructure `x`, add `useEffect`).
    - [ ] **Refactor**: Review for consistency with the existing `drag={isDragging ? false : dragProps.drag}` guard. Consider adding a comment grouping both lines as "bidirectional dnd-kit ↔ swipe conflict resolution".
    - [ ] Run full test suite, confirm no regressions.
    - [ ] Manual verification: reorder a task with finger offset to the left during drag → on release, no red flash.
- [ ] Task: Phase 3 Review Cleanup
    > **Blocks on**: "Fix swipe red flash" must be completed first — it exposes `x` from `useSwipeToReveal`, which changes the mock shape fixed below.
    - **Context**: `onDelete` was removed from `TaskCardProps` in Phase 2, but several call sites and tests still pass it. Also, one test has an empty body and mock shapes diverged from the real hook after the card-stuck fix and the red flash fix.
    - [ ] **Remove stale `onDelete` prop from `TaskList.tsx` DragOverlay** — line 200 passes `onDelete={() => {}}` to `<TaskCard>` inside `<DragOverlay>`. `TaskCardProps` no longer has `onDelete`. Delete the line. This is a TypeScript error that `tsc --noEmit` would catch.
    - [ ] **Remove stale `onDelete` prop from `TaskCard.color.test.tsx`** — every render call (5 total) passes `onDelete={vi.fn()}`. Remove all occurrences. Passes today only because vitest/esbuild skips type checking.
    - [ ] **Delete empty test in `TaskItem.swipe.test.tsx:175-186`** — `"resets swipe state when drag-to-reorder starts"` has no assertions, only comments explaining why it can't be tested here. The behavior it describes (dismiss all swipes on `onDragStart`) lives in `TaskList.tsx:78-80` and is currently **untested anywhere**. Delete the empty test from `TaskItem.swipe.test.tsx` **and** add a real test in `TaskList.test.tsx` that verifies: when `onDragStart` fires, `activeSwipeId` resets to `null` (i.e., `handleSwipeDismissAll()` is called with no args).
    - [ ] **Fix mock `useSwipeToReveal` return shape in `TaskItem.swipe.test.tsx`** — the mock includes `animate: { x: 0 }` in `dragProps` (lines 56, 69, 87, 106, 124) but the real hook no longer returns `animate` in `dragProps` (removed in commit 42b0fdd). Also missing `dragElastic` in `dragProps`, and missing `x` in the top-level return (added by the red flash fix). Update all mocks to match the real shape:
        ```typescript
        {
          isRevealed: false,
          isSwipeActive: false,
          x: { set: vi.fn(), get: () => 0 },  // MotionValue mock
          redOpacity: { get: () => 0 },
          dragProps: {
            drag: "x",
            dragConstraints: { left: -80, right: 0 },
            dragElastic: { left: 0.3, right: 0 },
            onDragStart: vi.fn(),
            onDrag: vi.fn(),
            onDragEnd: vi.fn(),
            style: { x: 0 },
          }
        }
        ```
    - [ ] **Add comment explaining `isSwipeActive` ref timing** — in `useSwipeToReveal.ts` line 91, `isSwipeActive: isSwipeActiveRef.current` returns a render-time snapshot, not the live ref. This works because `handleDrag` calls `onSwipeDismissAll(id)` → `TaskList` sets state → re-render propagates fresh `.current` before dnd-kit's 250ms delay expires. Add a brief comment at line 91 documenting this dependency.
    - [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors remain after the prop removals.
    - [ ] Run full test suite (`CI=true npm test`), confirm all tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 3 additions' (Protocol in workflow.md)
    - [ ] Red flash fix: reorder a task arrastando com o dedo deslocado para a esquerda durante o drag → ao soltar, sem flash vermelho
    - [ ] Cleanup não introduziu regressões visuais (swipe reveal, delete, reorder funcionam como antes)
