---
id: SPEC-002
title: Task model & list ordering
status: implemented
links: []
---

# Task model & list ordering

A task is a **title** plus an **estimated duration in minutes**. At any moment a task
is in exactly one state: **to do**, **running**, or **done**. When a task is done, it
additionally carries the real time it took and the moment it was finished
([SPEC-004]).

Rules the user can rely on:

- **At most one task runs at a time.** Starting a task while another is running sends
  the other back to "to do".
- **The list reads top-to-bottom as past → present → future:** done tasks form a
  block at the top, then the running task (if any), then the to-do tasks. Starting a
  task moves it to the boundary (right after the done block).
- New tasks are added at the **bottom** of the list.
- The user can **reset** the list (every task back to "to do", real-time records
  cleared) or **clear** it (remove all tasks). Both stop any running timer.

## Implementation pointers

- `src/types/index.ts`, `src/store/useTaskStore.ts`

## Log

- Seeded from code + conductor archive (2026-07-02)
