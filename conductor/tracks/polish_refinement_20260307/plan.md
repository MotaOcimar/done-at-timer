# Implementation Plan: Polish & Consistency Refinement

## Phase 1: Cleanup and Quick Wins
- [ ] Task: TDD - Delete `App.css` and its imports in `App.tsx` and `main.tsx`.
- [ ] Task: TDD - Hide spin buttons in numeric minute inputs via global CSS.
- [ ] Task: TDD - Fix `ArrivalDisplay` z-index to stay below modals/drawers but above task list.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Cleanup and Quick Wins' (Protocol in workflow.md)

## Phase 2: Design System Standardization (Tailwind v4 Theme)
- [ ] Task: TDD - Update `src/index.css` theme with standardized variables for border-radius, shadows, and button padding.
- [ ] Task: TDD - Refactor all buttons to use standardized padding and typography (`tracking-wide` instead of `tracking-widest`).
- [ ] Task: TDD - Apply standardized `radius` and `shadow` definitions across all cards and modal containers.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Design System Standardization' (Protocol in workflow.md)

## Phase 3: Visual Refinements and Transitions
- [ ] Task: TDD - Implement "Fast & Snappy" transitions (150-200ms) for color, opacity, and scale changes across all interactive components.
- [ ] Task: TDD - Redesign "Completed Task" style to use a muted color palette (e.g., slate/gray) instead of `opacity-70`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Visual Refinements and Transitions' (Protocol in workflow.md)
