# Implementation Plan: Intermediate Arrival Times (Inline ETAs)

This plan details the steps to implement per-task ETAs displayed inline within each task card. Every step follows strict TDD: write a failing test **first**, then write the minimum production code to make it pass, then refactor.

## Phase 1: State & Logic (Data Layer) [checkpoint: 9411049]
Goal: Record completion timestamps and compute per-task ETAs.

### 1.1 — `completedAt` field on Task type
- [x] RED: Write a store test asserting that `completeActiveTask` sets `completedAt` to a timestamp on the completed task. 0a5c107
- [x] GREEN: Update `Task` type in `src/types/index.ts` to include `completedAt?: number`. Update `completeActiveTask` in `src/store/useTaskStore.ts` to record `Date.now()`. 0a5c107
- [x] REFACTOR: Clean up if needed. 0a5c107

### 1.2 — `calculateIntermediateETAs` utility
- [x] RED: Write a test for **all-pending, no active task** — ETAs chain from `now`. a09a2be
- [x] GREEN: Create `calculateIntermediateETAs(tasks, activeTaskTimeLeft, now)` in `src/utils/time.ts` returning `Map<string, Date>`. Implement the pending-only path. a09a2be
- [x] REFACTOR. a09a2be
- [x] RED: Write a test for **active + pending** — active ETA = `now + timeLeft`, pending chain from active's ETA. a09a2be
- [x] GREEN: Implement the active task path. a09a2be
- [x] REFACTOR. a09a2be
- [x] RED: Write a test for **completed + active + pending** — completed tasks use `completedAt`, rest chains normally. a09a2be
- [x] GREEN: Implement the completed task path. a09a2be
- [x] REFACTOR. a09a2be
- [x] RED: Write a test for **overtime** (active `timeLeft <= 0`) — active ETA = `now`, pending chain from `now`. a09a2be
- [x] GREEN: Handle the overtime edge case. a09a2be
- [x] REFACTOR. a09a2be
- [x] RED: Write a test for **all completed** — every task uses its `completedAt`. a09a2be
- [x] GREEN: Ensure full-completed scenario works. a09a2be
- [x] REFACTOR. a09a2be

### 1.3 — Manual verification checkpoint
- [x] Conductor — Manual Verification of Phase 1. 9411049

## Phase 2: UI Integration (Card Changes) [checkpoint: 7b3bd68]
Goal: Display ETAs inline in each card and reorganize the active card's time info.

### 2.1 — Active card subtitle: show remaining time
- [x] RED: Write a component test asserting that the active card's subtitle renders `X min total · Y min left`. ced6347
- [x] GREEN: Update `TaskCard.tsx` subtitle for the active state. ced6347
- [x] REFACTOR. ced6347
- [x] RED: Write a test for the overtime variant: `X min total · Z min over`. ced6347
- [x] GREEN: Handle overtime in the subtitle. ced6347
- [x] REFACTOR. ced6347

### 2.2 — Active card footer: replace countdown with ETA
- [x] RED: Write a test asserting the active card's progress footer renders the formatted ETA (e.g., `→ 08:35`) instead of "X min left". 6a98690
- [x] GREEN: Replace the countdown span with the ETA display. Add `eta?: Date` prop to `TaskCard`. 6a98690
- [x] REFACTOR. 6a98690

### 2.3 — Pending cards: show ETA on subtitle
- [x] RED: Write a test asserting pending cards display the ETA right-aligned on the subtitle line. 24b7cbb
- [x] GREEN: Update `TaskCard.tsx` to render the ETA for idle/pending state. 24b7cbb
- [x] REFACTOR. 24b7cbb

### 2.4 — Completed cards: show actual finish time
- [x] RED: Write a test asserting completed cards display the completion time right-aligned on the subtitle line. 24b7cbb
- [x] GREEN: Update `TaskCard.tsx` to render `completedAt` formatted as time. 24b7cbb
- [x] REFACTOR. 24b7cbb

### 2.5 — Wire ETA data through component tree
- [x] RED: Write a `TaskList` integration test asserting that each `TaskItem` receives the correct `eta` prop computed from `calculateIntermediateETAs`. c870e1b
- [x] GREEN: Call `calculateIntermediateETAs` in `TaskList.tsx` and pass `eta` down through `TaskItem` → `TaskCard`. c870e1b
- [x] REFACTOR. c870e1b

### 2.6 — Manual verification checkpoint
- [x] Conductor — Manual Verification of Phase 2. 4d403fc

## Phase 3: Real-time Updates & Polish
Goal: Ensure ETAs update live, remain correct across all interactions, and refine UI/UX based on feedback.

### 3.1 — Real-time ETA recalculation
- [x] RED: Write a test asserting ETAs update when the clock advances (mock timer tick). 6b554e0
- [x] GREEN: Ensure the ETA computation re-runs every second (leverage existing `useTimer` or add a lightweight interval in `TaskList`). 6b554e0
- [x] REFACTOR. 6b554e0

### 3.2 — ETA UI Polish & Alignment (Feedback)
- [x] RED/GREEN: Fix ETA alignment in `TaskCard` so it sits perfectly right-aligned, below the action buttons area (trash icon space). 52986f4
- [x] RED/GREEN: Replace the `→` text with a `map-pin` SVG icon for pending/active tasks and `map-pin-check-inside` for completed tasks. 52986f4

### 3.3 — Reordering Constraints (Feedback)
- [x] RED: Write tests asserting that COMPLETED and IN_PROGRESS tasks cannot be reordered, and PENDING tasks cannot be moved above the IN_PROGRESS task. 9fccd59
- [x] GREEN: Remove drag handles from COMPLETED and IN_PROGRESS tasks in `TaskCard`. 9fccd59
- [x] GREEN: Update `handleDragEnd` in `TaskList` to clamp drop indices so PENDING tasks stay within the PENDING section. 9fccd59
- [x] REFACTOR. 9fccd59

### 3.4 — Drag-and-drop recalculation
- [x] RED: Write a test asserting that reordering tasks produces updated ETAs in the new order. 4bc5843
- [x] GREEN: Verify `reorderTasks` triggers re-render with recalculated ETAs (likely works for free via Zustand reactivity, but confirm). 4bc5843
- [x] REFACTOR. 4bc5843

### 3.5 — Consistency with Arrival Clock
- [x] RED: Write a test asserting the last task's ETA equals the value returned by `calculateArrivalTime`. f7d7af1
- [x] GREEN: Fix any discrepancy between the two calculations. f7d7af1
- [x] REFACTOR. f7d7af1

### 3.6 — Visual polish
- [x] Task: Final visual review — check color consistency across states (running/paused/overtime/idle/completed) and ensure ETA text doesn't truncate on small screens. 0eddddf

### 3.7 — Auto-reordering on play (Feedback)
- [x] RED: Write a store test asserting that starting a PENDING task moves it to the top of the active section (after COMPLETED tasks). 097430b
- [x] GREEN: Update `startTask` in `useTaskStore.ts` to reorder the `tasks` array. 097430b
- [x] REFACTOR. 097430b

### 3.8 — Smooth reordering animations (Feedback)

**Context:** `startTask()` reordena o array no Zustand e o React re-renderiza instantaneamente — os cards "pulam" sem transição. O `@dnd-kit` só anima durante drag manual, não em reordens programáticas. `framer-motion` com `layout` prop resolve isso via FLIP automático.

**Conflito dnd-kit ↔ framer-motion:** ambos manipulam posição do elemento. Solução: separar responsabilidades em dois wrappers — `motion.div` (outer, layout animation) e `div` com ref/style do dnd-kit (inner, drag transform). Desabilitar `layout` durante drag ativo (`layout={!isDragging}`) para evitar conflito de transforms.

- [x] Task: Install `framer-motion` — `npm install framer-motion`. 9cb760b
- [x] RED: Write a `TaskItem` test asserting the component renders a `motion.div` wrapper with `layout` prop (using `framer-motion`'s `motion` export). Verify it renders children correctly. b8d433e
- [x] GREEN: Refactor `TaskItem.tsx` — wrap `TaskCard` in a `motion.div` with `layout` and `transition={{ duration: 0.3, ease: 'easeInOut' }}`. Keep dnd-kit's `setNodeRef`/`style`/`attributes` on the inner `TaskCard` div (unchanged). Pass `isDragging` to control `layout={!isDragging}`. b8d433e
- [x] RED: Write a `TaskList` test asserting that wrapping the list in `<LayoutGroup>` does not break existing rendering (tasks still render in correct order with correct ETAs). b79ce6c
- [x] GREEN: Wrap the `SortableContext` children area in `TaskList.tsx` with `<LayoutGroup>` from `framer-motion` to scope layout animations. b79ce6c
- [x] REFACTOR: Verify no duplicate wrappers, clean up imports. Ensure `DragOverlay` card does NOT use `motion.div` (overlay is ephemeral and should not animate layout). b79ce6c
- [x] Manual test: Start a task that is NOT first in the list → confirm it animates smoothly to top. Drag-and-drop a pending task → confirm drag still works without jank. Complete a task → confirm it animates to the completed section. 1e33223
- [x] Task: Polish reordering animation — use `layout="position"` to prevent content stretching during size changes.

### 3.9 — Manual verification checkpoint
- [x] Conductor — Manual Verification of Phase 3. 5ad795c

## Phase 4: Architectural Consolidation & Robust Testing [checkpoint: e3bc82a]
Goal: Address identified fragilities and gaps to ensure long-term stability.

### 4.1 — Unify ETA Logic (Binding Architecturally)
- [x] RED: Write a test for `calculateArrivalTime` asserting that it always matches the last non-completed task's ETA from `calculateIntermediateETAs`. b9f50c0
- [x] GREEN: Refactor `calculateArrivalTime` to call `calculateIntermediateETAs` and return the last value (or `now` if all completed). b9f50c0
- [x] REFACTOR. b9f50c0

### 4.2 — Single Timer Source (Single Source of Truth)
- [x] RED: Write a test for a new `useClock` hook that provides a synchronized `Date` across components. b9f50c0
- [x] GREEN: Create `src/hooks/useClock.ts` and replace `setInterval` in `ArrivalDisplay.tsx` and `TaskList.tsx`. b9f50c0
- [x] REFACTOR. b9f50c0

### 4.3 — Robust Reordering Tests (Clamping Logic)
- [x] RED: Update `TaskList.test.tsx` with a more realistic `DndContext` mock that exercises reordering with mixed status lists (COMPLETED + IN_PROGRESS + PENDING). c870e1b
- [x] GREEN: Verify reordering constraints in `useTaskStore.ts` are robust against all edge cases. c870e1b
- [x] REFACTOR. c870e1b

### 4.4 — Edge Case Testing (Store Logic)
- [x] RED: Write store tests for `startTask` on an already active task (timer reset behavior) and for switching active tasks while paused (no elapsed time loss). b9f50c0
- [x] GREEN: Fix any identified bugs in `useTaskStore.ts`. b9f50c0
- [x] REFACTOR. b9f50c0

### 4.5 — Drag animation test coverage
- [x] RED: Write a `TaskItem` test asserting that `layout` becomes `false` when `isDragging` is `true` (mock `useSortable` to return `isDragging: true`). b9f50c0
- [x] GREEN: Verify existing implementation passes. b9f50c0
- [x] REFACTOR. b9f50c0

### 4.6 — Performance memoization
- [x] REFACTOR: Wrap `calculateIntermediateETAs` call in `TaskList.tsx` with `useMemo` (deps: `[tasks, activeTaskTimeLeft, currentTime]`). b9f50c0
- [x] REFACTOR: Wrap `sensors` declaration in `TaskList.tsx` with `useMemo` to avoid recreation on every render. b9f50c0

### 4.7 — Type-safety cleanup
- [x] REFACTOR: Remove `as keyof typeof` casts in `TaskCard.tsx` for `iconButtonClasses` and `timeDisplayClasses`. Narrow the `cardState` type so TypeScript can verify key access statically. b9f50c0

### 4.8 — ETA text truncation fix
- [x] REFACTOR: Add `whitespace-nowrap` (or equivalent) to the ETA `span` in `TaskCard.tsx` to prevent truncation on small screens. b9f50c0

### 4.9 — Revert `elapsedSeconds` task-switching feature (move to backlog)
**Context:** The `elapsedSeconds` field (introduced in 4.4) enables resuming a paused task's progress when switching between tasks. However, this feature has UX implications that weren't addressed: no way to reset an individual task's progress, no visual indicator that a non-active task has partial progress, and it adds complexity that conflicts with the app's minimalist vision. The feature should be evaluated as a product decision, not shipped as a side-effect of an edge-case fix.

**Action:** Remove `elapsedSeconds` from the store logic and the `Task` type. The `updateTask` path for `IN_PROGRESS` should no longer save/restore elapsed time on task switches — switching tasks simply resets the previous task to PENDING with a fresh timer. Add a backlog item for the feature if desired later.

- [x] RED: Write a store test asserting that switching from Task A to Task B resets Task A to PENDING **without** `elapsedSeconds`, and Task B starts with its full duration. b9f50c0
- [x] GREEN: Remove `elapsedSeconds` from `Task` type and `updateTask` logic. Remove the edge-cases test (4.4) that depended on this behavior. b9f50c0
- [x] REFACTOR: Clean up any remaining references to `elapsedSeconds`. b9f50c0

### 4.10 — Improve `useClock` test coverage
**Gap:** `useClock` uses module-level mutable state (`listeners` Set, `interval` variable) but tests don't cover re-mount or multi-consumer scenarios.

- [x] RED: Write a test asserting that after unmount and re-mount, the clock continues ticking (simulates strict mode / HMR). d0ee44c
- [x] RED: Write a test asserting that two simultaneous consumers share the same interval and both receive updates. d0ee44c
- [x] GREEN: Verify existing implementation passes (it should — these are coverage tests, not bug-driven). d0ee44c
- [x] REFACTOR. d0ee44c

### 4.11 — Manual verification checkpoint
- [x] Conductor — Manual Verification of Phase 4. e3bc82a

## Phase 5: ETA Visual Consistency (Feedback) [checkpoint: 431c1b0]
Goal: Eliminate the visual "zigzag" of ETA text across task states by normalizing size and weight, while keeping color variation tied to card state.

**Context:** Currently the ETA text varies significantly between states:
- Completed/Pending: `text-[10px] font-bold` (10px, weight 700)
- Active: `text-sm font-black` (14px, weight 900)

Combined with the completed card's `opacity-70`, this creates a jarring size/weight jump when scanning the task list vertically. The fix normalizes size and weight while preserving the per-state color, which the user considers an elegant touch.

**Changes:**
1. Pending/Completed ETA: `text-[10px] font-bold` → `text-xs font-bold` (10px → 12px)
2. Active ETA: `text-sm font-black` → `text-sm font-bold` (weight 900 → 700)

### 5.1 — Normalize non-active ETA size
- [x] RED: Update the existing `TaskCard` tests for pending/completed ETA to assert `text-xs` class instead of `text-[10px]`. 81f4529
- [x] GREEN: In `TaskCard.tsx`, change the non-active ETA `span` from `text-[10px]` to `text-xs`. 81f4529
- [x] REFACTOR. 81f4529

### 5.2 — Normalize active ETA weight
- [x] RED: Update the existing `TaskCard` test for active ETA to assert `font-bold` instead of `font-black`. 81f4529
- [x] GREEN: In `TaskCard.tsx`, change the active ETA `span` from `font-black` to `font-bold`. 81f4529
- [x] REFACTOR. 81f4529

### 5.3 — Manual verification checkpoint
- [x] Conductor — Manual Verification of Phase 5. 81f4529
