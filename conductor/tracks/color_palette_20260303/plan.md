# Implementation Plan: UI Color Palette Refinement

> **Methodology**: Strict TDD (Red → Green → Refactor) and SOLID principles throughout.
> Every task starts by writing a failing test, then the minimal implementation to pass it, then refactoring.

## Phase 1: Update State Colors [checkpoint: 3c25504]

- [x] Task: **RED** — Write failing tests asserting neutral color classes on idle/pending play button (gray instead of blue)
- [x] Task: **GREEN** — Implement neutral color for idle/pending state play button and associated indicators [fea914f]
- [x] Task: **RED** — Write failing tests asserting neutral (gray) color classes when active task is paused
- [x] Task: **GREEN** — Implement neutral color for paused state (card, icon, text) [8e7bb44]
- [x] Task: **RED** — Write failing tests asserting softer tone classes for overtime state
- [x] Task: **GREEN** — Implement softer color for overtime state (card, icon, text, done button, time display) [b9a4a53]
- [x] Task: **RED** — Write failing tests asserting ProgressBar color changes based on task state (blue when running, gray when paused, softer tone when overtime)
- [x] Task: **GREEN** — Make ProgressBar state-aware by accepting a state prop and applying the corresponding color [fc9d662]
- [x] Task: **REFACTOR** — Review all color changes for consistency across components, extract shared color constants if needed [c83ae02]
- [x] Task: **RED** — Write missing tests for StatusIcon pause button colors and explicit 'running' state colors in TaskCard.color.test.tsx [7428f52]
- [x] Task: **GREEN** — Centralize remaining inline color logic (time display, StatusIcon pause button) into cardState mappings in TaskCard.tsx [9842c12]

## Phase 2: Main Timer Color Refinement [checkpoint: d144c9b]

- [x] Task: **RED** — Write failing tests for ArrivalDisplay asserting neutral gray when paused and softer amber when overtime [7f91a2d]
- [x] Task: **GREEN** — Implement color refinement in ArrivalDisplay based on current task state (paused, overtime, running) [9a42e1d]
- [x] Task: **REFACTOR** — Ensure consistency between ArrivalDisplay and TaskCard color logic [d144c9b]

- [ ] Task: Conductor - User Manual Verification 'UI Color Palette Refinement' (Protocol in workflow.md)
