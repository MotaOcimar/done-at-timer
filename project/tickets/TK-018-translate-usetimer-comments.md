---
id: TK-018
title: Translate Portuguese comments in useTimer.ts to English
type: chore
status: done
specs: []
---

# Translate Portuguese comments in useTimer.ts to English

## Context
`src/hooks/useTimer.ts` still carries Portuguese comments; the codebase standard is
English. Trivial consistency chore. Migrated from `conductor/backlog.md` (TK-001).

## Acceptance criteria
- [x] No Portuguese comments remain in `src/hooks/useTimer.ts` (or elsewhere in
      `src/`, while at it).

## Notes
If TK-019 (unified timer architecture) lands first, do this as part of that
refactor instead.
