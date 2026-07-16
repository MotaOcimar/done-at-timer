---
id: SPEC-003
title: Timer behavior (real-time anchoring, pause, overtime)
status: implemented
links: [SPEC-002, SPEC-004]
---

# Timer behavior

- **The countdown is anchored to the real-world clock, not to counted seconds.**
  When a task starts, the moment it is due to end is fixed; the remaining time shown
  is always the distance from "now" to that moment. Observable consequences:
  - the countdown never drifts, even if the tab is backgrounded or the device sleeps;
  - closing or reloading the page does not stop a running timer — reopening shows the
    correct remaining time, as if the app had never left ([SPEC-013]).
- **Overtime:** when the due moment passes, the timer does not stop or advance
  anything — it keeps counting past zero into negative territory and waits for the
  user to confirm completion ([SPEC-004]).
- **Pause** freezes progress: the remaining time stops shrinking. Since the user's
  arrival keeps getting later while nothing progresses, the arrival time visibly
  drifts forward during a pause ([SPEC-006]).
- **Resume** continues from exactly the remaining time left at pause.
- **Editing the estimate of the running task** keeps the progress already made: the
  due moment moves by the difference (e.g. +5 min of estimate = due 5 min later).

## Known limitations

- Only the currently running task's partial progress is remembered. If the user
  switches to another task (or the running task is sent back to "to do"), that
  partial progress is discarded and the task will later restart from zero. Accepted
  for now; TK-002 proposes remembering progress per task.

## Implementation pointers

- `src/hooks/useTimer.ts`, `src/store/useTaskStore.ts`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-030: fixed overtime not re-engaging when a task overruns on a later run of the
  same list — no behavior text changed; the spec was right, the code was wrong
  (2026-07-10)
- TK-019: unified all timers onto one shared tick source — internal refactor, no
  behavior text changed (2026-07-16)
