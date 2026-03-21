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

1. **Interactive elements** — Clicks/taps on `InlineEdit` inputs, Play/Pause, Done, and other buttons are handled normally. These elements use `e.stopPropagation()` or `onPointerDown` handlers that prevent both swipe and drag from activating. The dnd-kit `listeners` are applied to the card container but interactive children naturally consume their own pointer events.
2. **Swipe-to-delete** — immediate, no hold delay. Right-to-left horizontal drag on the card surface triggers swipe reveal. Safe because it only reveals a confirmation button. Not available on completed tasks.
3. **Drag-to-reorder** — requires a hold delay (via dnd-kit `TouchSensor` delay / `MouseSensor` distance). After hold threshold is met, any direction **except right-to-left** initiates reorder.
4. **Right-to-left always wins** — regardless of hold state, a right-to-left gesture is always swipe-to-delete, never reorder.

### Implementation approach
- **Swipe layer**: Use `framer-motion` `drag="x"` on a wrapper inside `TaskItem.tsx`, constrained to horizontal only (`dragConstraints`). This layer sits above the dnd-kit sortable layer. On right-to-left gesture, it calls `stopPropagation()` on the pointer event to prevent dnd-kit sensors from activating.
- **DnD layer**: Keep `@dnd-kit` `useSortable` in `TaskItem.tsx`. Apply `listeners` and `attributes` to the card's outer container. The existing `MouseSensor` distance constraint (10px) and `TouchSensor` delay (250ms) provide natural hold-to-drag behavior.
- **Interactive elements**: Buttons and inputs already call `e.stopPropagation()` on click. For `InlineEdit`, the `onPointerDown` on focused inputs should stop propagation to prevent drag initiation during text selection.

## Phase 1: Reordering & Cleanup
Focus on removing the drag handles and enabling whole-card dragging while preserving interactive element functionality.

- [ ] Task: Remove `GripHorizontal` drag handle and spacer from `TaskCard.tsx`
    - [ ] Remove the `GripHorizontal` import and icon rendering (line 200).
    - [ ] Remove the empty spacer `<div className="w-5 flex-shrink-0" />` that renders for active/completed tasks (line 203).
    - [ ] Remove the entire conditional block (lines 192-204) wrapping handle + spacer.
    - [ ] Update CSS/Tailwind to reclaim the horizontal space previously occupied by the handle column.
- [ ] Task: Enable whole-card dragging
    - [ ] Move `listeners` and `attributes` (from dnd-kit) from the drag handle div to the card's outer `<div ref={setNodeRef}>` container.
    - [ ] Ensure interactive elements (InlineEdit, StatusIcon/Play/Pause, Done button) remain clickable — they already use `e.stopPropagation()` on click; verify this is sufficient with `listeners` on the parent.
    - [ ] If InlineEdit text selection triggers drag, add `onPointerDown` with `stopPropagation` to focused InlineEdit inputs.
    - [ ] Verify `TouchSensor` delay (250ms) and `MouseSensor` distance (10px) in `TaskList.tsx` provide adequate hold-to-drag behavior — adjust if needed.
- [ ] Task: Update tests for Phase 1
    - [ ] Update `TaskCard.test.tsx` — remove assertions for drag handle presence and spacer div.
    - [ ] Add test: verify interactive elements (buttons, inputs) remain functional with whole-card dragging.
    - [ ] Ensure reordering tests in `TaskList.test.tsx` still pass with whole-card dragging.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Reordering & Cleanup' (Protocol in workflow.md)

## Phase 2: Swipe-to-Delete Implementation
Introduce the swipe-to-delete gesture and the "Delete" button revealed behind the card. Swipe is available on all tasks **except completed**.

- [ ] Task: Implement swipe gesture layer on `TaskItem.tsx`
    - [ ] Wrap `TaskCard` in a `motion.div` with `drag="x"` (horizontal axis only) inside `TaskItem.tsx`.
    - [ ] Constrain drag: only allow right-to-left (negative x), clamp to reveal width (e.g., `-80px`).
    - [ ] Implement "Reveal & Stay" logic: right-to-left swipe past threshold (e.g., 40px) snaps to reveal position via `dragSnapToOrigin: false` + `onDragEnd` with `animate`.
    - [ ] Implement dismiss: left-to-right swipe (or tap card) snaps back to `x: 0`.
    - [ ] Intercept right-to-left gestures: call `stopPropagation()` in `onPointerDown`/`onDragStart` when direction is right-to-left, preventing dnd-kit sensors from activating.
    - [ ] Disable swipe for completed tasks (check `task.status === 'COMPLETED'`).
- [ ] Task: Create "Reveal Behind" area with Delete button
    - [ ] Add a positioned layer (absolute, right-aligned) behind the task card containing a red "Delete" button.
    - [ ] Ensure the button is only visible/clickable when the card is swiped open (`overflow: hidden` on the container, or conditional rendering based on swipe state).
    - [ ] Delete button must meet min 44x44px touch target.
- [ ] Task: Remove existing inline delete button from `TaskCard.tsx`
    - [ ] Remove the `Trash2` import (if no longer used elsewhere) and button rendering.
    - [ ] Remove the associated `onDelete` prop from `TaskCardProps` if it's no longer needed (the delete action moves to the reveal layer in `TaskItem.tsx`).
- [ ] Task: Connect revealed Delete button to `removeTask` in `useTaskStore`
    - [ ] Wire the onClick of the revealed Delete button to call `removeTask(id)`.
    - [ ] `TaskItem.tsx` already receives `onDelete` prop — reuse it for the revealed button.
- [ ] Task: Add keyboard accessibility fallback for delete
    - [ ] Allow `Delete` key to trigger task removal when a card is focused (add `onKeyDown` handler to card container).
    - [ ] Ensure screen readers can discover the delete action (e.g., `aria-label` on the card or a visually hidden button).
- [ ] Task: Add tests for swipe-to-delete
    - [ ] Test that right-to-left swipe reveals the Delete button (simulate drag via `fireEvent` or `framer-motion` test utils).
    - [ ] Test that clicking the revealed Delete button calls `removeTask`.
    - [ ] Test that completed tasks do not have swipe-to-delete.
    - [ ] Test that the inline Trash2 delete button no longer exists.
    - [ ] Test keyboard delete fallback (`Delete` key).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Swipe-to-Delete Implementation' (Protocol in workflow.md)

## Phase 3: Polish & Mobile Verification
Refine the feel of interactions and verify they work well across devices. This phase has no new functionality — it's about tuning what was built in Phases 1-2.

- [ ] Task: Tune swipe animation parameters
    - [ ] Adjust `framer-motion` spring/tween config for the swipe reveal: test damping, stiffness, and duration to ensure the snap feels responsive but not jarring.
    - [ ] Add elastic resistance when dragging beyond the reveal position (rubberband effect) so the user feels the boundary.
    - [ ] Ensure the dismiss animation (snap back to `x: 0`) is quick and smooth (~200ms).
- [ ] Task: Add haptic feedback on swipe reveal
    - [ ] Use `navigator.vibrate(10)` (Vibration API) when the swipe crosses the reveal threshold.
    - [ ] **Limitation**: Vibration API is not supported on iOS Safari and has inconsistent support across browsers. Gate behind `'vibrate' in navigator` check. This is a progressive enhancement — the feature must work fully without it.
- [ ] Task: Verify mobile touch targets and responsiveness
    - [ ] Confirm the revealed Delete button meets 44x44px minimum on mobile viewports.
    - [ ] Test that swipe and drag-to-reorder don't conflict on touch devices (especially the 250ms hold delay).
    - [ ] Test on small screens (320px width) — ensure the revealed Delete area doesn't overflow or clip the card content.
    - [ ] Verify that scrolling the task list vertically is not accidentally intercepted by swipe gestures.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Polish & Mobile Verification' (Protocol in workflow.md)
