---
id: SPEC-013
title: Persistence (everything survives on-device)
status: implemented
links: [SPEC-003, SPEC-011, SPEC-001]
---

# Persistence

Everything the user builds survives closing or reloading the app, with no account
and no server ([SPEC-001]):

- the task list, including each task's state and completion records;
- a **running timer** — because the timer is anchored to the real-world clock
  ([SPEC-003]), reopening the app shows the correct remaining time, including having
  slid into overtime while the app was closed;
- saved routines;
- preferences (e.g. the notification toggle).

Boundaries the user should understand:

- Data lives **in this browser on this device**. Clearing the browser's site data
  erases everything; another browser or device starts empty. The one sanctioned
  way to move a routine across devices is a share link ([SPEC-011]) — a one-shot
  copy, not sync.

## Implementation pointers

- `src/store/useTaskStore.ts` (persistence configuration)

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-003: sharing research concluded — URL sharing planned as TK-021 (2026-07-03)
- TK-021: the on-device boundary gained the share-link exception (2026-07-03)
