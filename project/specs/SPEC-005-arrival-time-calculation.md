---
id: SPEC-005
title: Arrival time calculation (main clock & per-task ETAs)
status: implemented
links: [SPEC-002, SPEC-003]
---

# Arrival time calculation

Every task has its own expected finish time (ETA), computed in list order:

- **Done task:** shows the moment it was actually completed (a fact, not a
  projection).
- **Running task:** finishes at "now + remaining time". In overtime the remaining
  time counts as zero — the projection never pretends the past can be recovered, so
  everything after an overrun task starts from "now".
- **To-do task:** finishes at the previous task's ETA plus its own estimate.

The **main arrival time** is the ETA of the last not-done task — "if I keep going
right now, when am I free?". With an empty list, or everything done, the arrival
time is simply the current time.

The projection updates every second: any pause, overtime or edit is reflected
immediately in all ETAs.

## Implementation pointers

- `src/utils/time.ts`

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-036: running task's ETA now computed from the fixed due moment rather than
  re-derived from the moving clock each second — same instant, but it can no longer
  wobble between adjacent minutes; no behavior text changed (2026-07-16)
