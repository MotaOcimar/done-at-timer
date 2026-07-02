---
id: TK-019
title: Unify timer ticks — useTimer consumes useClock's now
type: chore
status: open
specs: [SPEC-003]
---

# Unify timer ticks — useTimer consumes useClock's now

## Context
`useTimer` maintains its own `setInterval` ticks while `useClock` already provides
a synchronized "now" — duplicate tick logic and two sources of truth for
time-based calculations. Refactor `useTimer` to consume `useClock`, keeping every
behavior guaranteed by [SPEC-003] (real-time anchoring, pause, overtime) intact.
Migrated from `conductor/backlog.md` (TK-001).

## Acceptance criteria
- [ ] A single tick source drives all time-based calculations.
- [ ] All existing timer tests pass unchanged — no observable behavior change, so
      SPEC-003 stays accurate as written.
