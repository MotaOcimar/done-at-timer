---
id: TK-016
title: Routine chaining (queue routines with per-routine arrival times)
type: idea
status: open
specs: [SPEC-011, SPEC-005, SPEC-006]
---

# Routine chaining (queue routines with per-routine arrival times)

## Context
Users plan their day in blocks (breakfast, study, leisure) and care most about
"will I finish *this* block in time to start the next one?" — not when the whole
day ends. Chaining would let the user queue multiple routines ([SPEC-011]), each
with its own arrival time, with the main clock ([SPEC-006]) reflecting only the
current routine. Migrated from `conductor/backlog.md` (TK-001).

## Notes
Idea stage — must graduate before any work. Key design constraints captured from
the original backlog discussion:

- **Simplicity first**: the whole point of the app is reducing mental load; visible
  complexity defeats the purpose ([SPEC-001]).
- **Arrival time clarity**: one idea is the sticky clock always shows the *current*
  routine's arrival; other routines' arrivals appear only when scrolled into view.
- **Visual separation**: clear boundaries between routine blocks in the task list.
- **Transition behavior**: what happens when a routine finishes — auto-advance or a
  checkpoint? Ties into TK-013.
- **Interaction with the library**: does each routine in a chain remain
  independently saveable/loadable?
