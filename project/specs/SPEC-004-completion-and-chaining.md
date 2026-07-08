---
id: SPEC-004
title: Manual completion & task chaining
status: implemented
links: [SPEC-002, SPEC-003]
---

# Manual completion & task chaining

- **Tasks never complete themselves.** When time runs out the app signals it
  (visuals per [SPEC-006], notification per [SPEC-014]) and keeps counting overtime;
  only the user can confirm that the task is actually finished. This is what keeps
  the arrival time honest when reality diverges from the estimate.
- Confirming completion records, on the task:
  - the **real time spent**, in whole minutes rounded up — finishing early records
    the time actually used, not the estimate;
  - the **moment of completion**.
- **Chaining:** confirming completion immediately starts the next to-do task (top of
  the to-do section), with its full estimated duration. When no task remains, the
  session goes idle and the celebration shows ([SPEC-006]).
- **Deleting the running task** behaves like skipping it: the next to-do task starts
  automatically (or the session goes idle).

## Known limitations

- Chaining is always on; an option to require a manual "start next" between tasks is
  a backlog idea (not yet a ticket).

## Implementation pointers

- `src/store/useTaskStore.ts`

## Log

- Seeded from code + conductor archive (2026-07-02)
