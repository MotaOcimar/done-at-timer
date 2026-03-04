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
- [ ] RED: Write a `TaskList` test asserting that wrapping the list in `<LayoutGroup>` does not break existing rendering (tasks still render in correct order with correct ETAs).
- [ ] GREEN: Wrap the `SortableContext` children area in `TaskList.tsx` with `<LayoutGroup>` from `framer-motion` to scope layout animations.
- [ ] REFACTOR: Verify no duplicate wrappers, clean up imports. Ensure `DragOverlay` card does NOT use `motion.div` (overlay is ephemeral and should not animate layout).
- [ ] Manual test: Start a task that is NOT first in the list → confirm it animates smoothly to top. Drag-and-drop a pending task → confirm drag still works without jank. Complete a task → confirm it animates to the completed section.

### 3.9 — Manual verification checkpoint
- [ ] Conductor — Manual Verification of Phase 3.
