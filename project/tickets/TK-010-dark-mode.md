---
id: TK-010
title: Dark mode with manual toggle
type: feature
status: open
specs: []
---

# Dark mode with manual toggle

## Context
The app only has a light theme. A dark theme with a manual toggle (likely in the
Control Center, [SPEC-012]) is a long-standing roadmap item. Migrated from
`conductor/backlog.md` (TK-001).

## Acceptance criteria
- [ ] A dark theme covers every screen and component, preserving the state color
      semantics (running/paused/overtime/done) that specs rely on.
- [ ] The user can toggle the theme manually; the choice persists across sessions
      ([SPEC-013]).
- [ ] A new spec is created describing theming behavior, and this ticket's `specs:`
      list is updated to cite it (plus SPEC-012/SPEC-013 if they change).

## Notes
Design should decide whether the default follows `prefers-color-scheme` or stays
light until toggled.
