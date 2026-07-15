---
id: TK-037
title: Reshape persisted state — store sources of truth, derive the rest
type: chore
status: open
specs: [SPEC-002, SPEC-003, SPEC-013]
---

# Reshape persisted state — store sources of truth, derive the rest

## Context

User request (2026-07-15), from an earlier localStorage exploration (annotated
snapshot in Notes): the persisted store mixes sources of truth with derived
values. Today it saves `activeTaskTimeLeft`, `isTimeUp`, `targetEndTime` and
`totalElapsedBeforePause` alongside the tasks — all reconstructible from a
task's start moment, its estimate, and pause history — while the one anchor
that cannot be reconstructed, **when the task started**, is never recorded.

Persisting derived values invites the class of bug where display and truth
disagree (TK-036 is the visible symptom; the user suspected this shape could
be hiding others). Reshaping around sources of truth also feeds several open
tickets:

- **TK-034** needs `startedAt` on tasks — recorded here as the store's anchor.
- **TK-019** (single tick source) becomes simpler when ticks only *derive*
  values instead of owning persisted state.
- **TK-007** (paused time tracking) and **TK-002** (partial progress per
  task) both want per-task elapsed/pause history, which the user's note
  already anticipates ("totalElapsedBeforePause: no futuro, talvez ser salvo
  por task").

Proposed shape (from the user's note):

- Tasks: `expectedDuration` (renamed from `duration`), `startedAt` (new),
  `completedAt`; `actualDuration` becomes derived (`completedAt − startedAt`,
  minus pauses once tracked).
- Session: keep `activeTaskId`; stop persisting `activeTaskTimeLeft`,
  `isTimeUp`, and (if derivable) `targetEndTime`.

## Acceptance criteria

- [ ] Tasks record when they started (`startedAt`), surviving reload.
- [ ] Values reconstructible from stored anchors are computed, not persisted
      (at minimum `activeTaskTimeLeft` and `isTimeUp` leave the persisted
      shape).
- [ ] Existing persisted data migrates: a device with pre-change state loads
      without losing tasks, routines, progress, or notification preference
      ([SPEC-013]).
- [ ] All timer behaviors guaranteed by [SPEC-003] (real-time anchoring,
      pause, overtime, reload recovery) are covered by tests and unchanged.
- [ ] No observable behavior change otherwise — specs stay accurate as
      written (SPEC-002/SPEC-013 updated only where they describe the stored
      model).

## Design

(open dilemmas, to close at planning)

- **Rename scope:** `duration` → `expectedDuration` touches the Task and
  Routine types, and the routine share-link payload (TK-021) — decide whether
  the wire format keeps the old key (compatibility) while the code renames,
  or bumps the link version.
- **`targetEndTime`:** derivable from `startedAt + expectedDuration + pause
  history`, but pause history doesn't exist yet (TK-007). Decide whether it
  stays persisted until TK-007 lands or a minimal pause record ships here.
- **Migration strategy:** zustand `persist` version + `migrate`, mapping old
  fields (e.g. a running task's `startedAt` back-computed from
  `targetEndTime − expectedDuration`); completed tasks keep `actualDuration`
  as a fallback where `startedAt` is unknowable (TK-034 degrades gracefully).
- **Sequencing** with TK-019/TK-034/TK-036 — this ticket is the natural
  foundation; order decided when work starts.

## Plan

(to be written when work starts)

## Notes

User's annotated localStorage snapshot (2026-07-15, abridged):

```jsonc
{
  "tasks": [
    {
      "id": "…",
      "title": "…",
      "expectedDuration": 5, // rename of "duration"
      "status": "COMPLETED",
      "actualDuration": 9, // could become "startedAt" + derived
      "completedAt": 1774373264072
    },
    {
      "id": "…",
      "title": "…",
      "expectedDuration": 30,
      "status": "IN_PROGRESS",
      "startedAt": 1774373264072 // new field — lets actualDuration,
      // activeTaskTimeLeft and isTimeUp be derived dynamically
    }
  ],
  "activeTaskTimeLeft": 1793, // persist?
  "activeTaskId": "…",
  "targetEndTime": 1774375064072, // persist?
  "totalElapsedBeforePause": 0, // future: per task (depends on per-task restart)
  "isTimeUp": false, // persist?
  "isNotificationsEnabled": true,
  "routines": [{ "id": "…", "name": "…", "tasks": [{ "title": "a", "expectedDuration": 1 }] }]
}
```
