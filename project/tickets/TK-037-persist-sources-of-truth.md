---
id: TK-037
title: Reshape persisted state — store sources of truth, derive the rest
type: chore
status: done
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
- **TK-019** (single tick source) becomes simpler when ticks only _derive_
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

(closed 2026-07-15, settled against the code and presented to the user)

- **Wire format untouched.** The share-link payload is already an independent
  format (`SharedRoutine`, explicit field mapping in
  `src/utils/routineShare.ts`, `v: 1`): the internal rename
  `duration → expectedDuration` stops at the encode/decode boundary. The wire
  keeps `duration`; old and new builds interop; no version bump. A test pins
  the wire key so a future rename can't silently leak into links.
- **`targetEndTime` stays persisted — it is an anchor, not a derivative.** It
  carries the start of the _current running segment_ (after any pauses), and
  SPEC-003's reload recovery depends on it. It only becomes derivable once
  per-task pause history exists — that is TK-007's job, out of scope here.
  What leaves the persisted shape now: `activeTaskTimeLeft` and `isTimeUp`
  (pure derivatives of `targetEndTime` vs. now; kept as runtime state,
  excluded via `partialize`, re-derived on rehydrate).
- **`actualDuration` stays stored — deriving it would change its meaning.**
  Today it measures _active_ time (pauses excluded). `completedAt − startedAt`
  is wall-clock time _including_ pauses — a semantic change, not a
  simplification. A chore must not change observable behavior; the derived
  form waits for TK-007's pause records. (The user's note assumed the
  no-pause case, where the two coincide.)
- **`startedAt` records the first start of each task** (every path that sets
  `IN_PROGRESS`: manual start, auto-advance on completion, auto-advance on
  removing the active task), cleared by reset/load like `completedAt`. It is
  the anchor TK-034 displays. A paused-then-resumed task keeps its original
  `startedAt`.
- **Migration:** zustand `persist` gains `version: 1` + `migrate`. v0 → v1:
  rename `duration` → `expectedDuration` on tasks and routines; back-compute
  the running task's `startedAt` as `targetEndTime − expectedDuration` (exact
  when unpaused; absent if the reload happens mid-pause — acceptable, the
  field is display-only); completed tasks get **no** invented `startedAt`
  (TK-034 degrades gracefully); drop `activeTaskTimeLeft`/`isTimeUp`.
- **Out of scope:** single tick source (TK-019), per-task pause/progress
  records (TK-007/TK-002), any display change (TK-034/TK-036).

## Plan

- [x] Red/Green: `startedAt` recorded on every `IN_PROGRESS` transition
      (start, auto-advance after complete, auto-advance after removing the
      active task); cleared by `resetTasks`/`loadRoutine`; survives
      pause/resume unchanged. Also: a task demoted to PENDING loses its
      anchor. (992f269)
- [x] Refactor: rename `duration` → `expectedDuration` across types, store,
      components, tests; wire-format test pins `duration` as the link key.
      Mapping lives entirely in `routineShare.ts`; prose (test names,
      comments, the "Task duration" aria-label) untouched. (021beb4)
- [x] Red/Green: persistence shape — `partialize` excludes
      `activeTaskTimeLeft`/`isTimeUp`; rehydrate re-derives them from
      `targetEndTime` (or the pause record) via a `merge` hook. (e3722e3)
- [x] Red/Green: `migrate` v0 → v1 (renames, running task's back-computed
      `startedAt`, dropped fields; routines untouched beyond the rename).
      (e3722e3)
- [x] Full suite + lint + format (332 tests green, tsc clean).
- [x] Update SPEC-002 and SPEC-013 (stored-model descriptions only; SPEC-003
      needed no change — the behavior it describes was preserved). (c93163d)
- [x] Manual check on the running app: a same-origin seed page wrote a
      realistic v0 snapshot (generic titles) into localStorage of the built
      app; the user drove both scenarios on their device — mid-run (done +
      running + pending tasks, routine, notifications off) and mid-pause
      (6 of 10 min left) — everything intact.

## Acceptance

Chore, normally exempt — gated anyway because a migration can lose data.
Accepted by the user on the built app (preview + v0 seed page), 2026-07-16.

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
      "completedAt": 1774373264072,
    },
    {
      "id": "…",
      "title": "…",
      "expectedDuration": 30,
      "status": "IN_PROGRESS",
      "startedAt": 1774373264072, // new field — lets actualDuration,
      // activeTaskTimeLeft and isTimeUp be derived dynamically
    },
  ],
  "activeTaskTimeLeft": 1793, // persist?
  "activeTaskId": "…",
  "targetEndTime": 1774375064072, // persist?
  "totalElapsedBeforePause": 0, // future: per task (depends on per-task restart)
  "isTimeUp": false, // persist?
  "isNotificationsEnabled": true,
  "routines": [
    {
      "id": "…",
      "name": "…",
      "tasks": [{ "title": "a", "expectedDuration": 1 }],
    },
  ],
}
```
