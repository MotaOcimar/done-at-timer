# Implementation Plan: UI Color Palette Refinement

> **Methodology**: Strict TDD (Red → Green → Refactor) and SOLID principles throughout.
> Every task starts by writing a failing test, then the minimal implementation to pass it, then refactoring.

## Phase 1: Update State Colors

- [ ] Task: **RED** — Write failing tests asserting neutral color classes on idle/pending play button (gray instead of blue)
- [ ] Task: **GREEN** — Implement neutral color for idle/pending state play button and associated indicators
- [ ] Task: **RED** — Write failing tests asserting neutral (gray) color classes when active task is paused
- [ ] Task: **GREEN** — Implement neutral color for paused state (card, icon, text)
- [ ] Task: **RED** — Write failing tests asserting softer tone classes for overtime state
- [ ] Task: **GREEN** — Implement softer color for overtime state (card, icon, text, done button, time display)
- [ ] Task: **RED** — Write failing tests asserting ProgressBar color changes based on task state (blue when running, gray when paused, softer tone when overtime)
- [ ] Task: **GREEN** — Make ProgressBar state-aware by accepting a state prop and applying the corresponding color
- [ ] Task: **REFACTOR** — Review all color changes for consistency across components, extract shared color constants if needed
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Update State Colors' (Protocol in workflow.md)
