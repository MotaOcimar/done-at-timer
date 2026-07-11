---
id: TK-030
title: Fix task staying blue instead of turning amber when it overruns after a re-run
type: bug
status: done
specs: [SPEC-003]
---

# Fix task staying blue instead of turning amber when it overruns after a re-run

## Context

Intermittent bug reported by the user: sometimes a task that reaches its limit does
not enter overtime — it stays blue instead of turning amber. This violates
[SPEC-003] ("when the due moment passes … it keeps counting past zero"), and the
symptom surfaces through [SPEC-010] (card stays in the running look instead of the
overtime look) and [SPEC-014] (the time-up notification never fires).

**Root cause (confirmed with an isolated failing test):** `useTimer` guards its
`onComplete` call with a one-shot latch (`hasNotifiedComplete`). The only thing that
re-arms it is the hook's `reset()` — which no production code ever calls. Each
`TaskItem` keeps its timer instance mounted for as long as the task exists in the
list (`key={task.id}`), so once a task has overrun **once**, the latch stays latched.
On the next run of that same task (e.g. after the "Reset" button re-runs a routine),
crossing zero no longer calls `onComplete` → the store's `onTimeUp()` never runs →
`isTimeUp` stays `false` → the card stays blue and no notification fires.

Why it looks intermittent: only tasks that have **already overrun** since the page
was last loaded are affected. Tasks finished early keep a fresh latch; a page reload
or loading a routine (new task ids) also produces fresh timer instances — which
masks the bug.

Secondary finding, same code: on the run where it _does_ fire, `onComplete` can fire
twice — the latch lives in `useState`, so interval ticks in the same batch read a
stale `false`. Harmless today (`onTimeUp` is idempotent, `NotificationManager`
dedupes per task id), but the fix removes it for free.

## Acceptance criteria

- [ ] A task that overran on a previous run turns amber (overtime) again when it
      crosses its limit on a later run of the same list — no page reload needed.
- [ ] The time-up notification fires again on that later run ([SPEC-014]).
- [ ] Crossing zero notifies exactly once per run (no double fire).
- [ ] A task restarted with fresh time shows as running (blue) again until it
      actually overruns — overtime state from the previous run does not leak.
- [ ] Existing timer/overtime behavior unchanged ([SPEC-003] suite stays green).

## Design

- **Fix inside `useTimer`, not in callers:** re-arm the completion latch whenever
  `targetEndTime` changes. Every "new run" — start, restart after routine reset,
  resume after pause — manifests as a new `targetEndTime`, so this is the single
  choke point. The alternative (callers invoking `reset()` at the right moments)
  reintroduces the manual coordination whose absence caused the bug.
- **Latch becomes a `useRef`** instead of `useState`: it is bookkeeping, not render
  state. This removes the stale-closure double fire and the latch from effect deps
  (no effect re-runs on latch flips). `reset()` also clears the ref, preserving the
  hook's public contract.
- **Consequence accepted:** resuming a task that is already in overtime re-fires
  `onComplete`. Harmless: `onTimeUp()` is idempotent and `NotificationManager`
  dedupes by task id. Correct, even — the task is still overtime.
- Store `isTimeUp` already resets on start/complete/reset paths; no store changes.

Out of scope: TK-019 (tick unification — this stays within the current interval
mechanics); TK-002 (per-task partial progress); notification content/behavior.

## Plan

- [x] Red: `useTimer` test — after firing once, restarting the same hook instance
      with a new future `targetEndTime` fires `onComplete` again when it crosses
      zero; and exactly once per run.
- [x] Green: latch → `useRef`, re-armed when `targetEndTime` changes; `reset()`
      clears it; legacy (no-target) path reads the ref.
- [x] Full suite (301 tests, 45 files), lint, build, prettier — all green.
- [x] SPEC-003: add Log line (no behavior text changes — the spec was right, the
      code was wrong).
- [x] Self-check on the running app (headless Chromium driving the real UI):
      1-min task → amber after 53s → Done → Restart Routine → starts blue (no
      overtime leak) → amber again after 54s on run 2 — the step the bug broke.
      Moved to `in-review`.

## Acceptance

Accepted by the user on 2026-07-11 ("Aqui deu certo também") on the running app —
a task that had overrun before turns amber again when it overruns on a later run.

## Notes

Environment couldn't produce screenshots (PRoot: Chromium's GPU process can't
run, so no compositor frames); self-check evidence is the driven DOM state —
card classes `bg-blue-50` → `bg-amber-50` per run and the "1 min over" copy.
The browser-driving recipe for this environment is captured in
`.claude/skills/verify/SKILL.md`.
