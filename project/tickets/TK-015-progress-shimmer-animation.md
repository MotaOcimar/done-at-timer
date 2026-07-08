---
id: TK-015
title: Replace progress-bar pulse with a shimmer/wave animation
type: feature
status: open
specs: [SPEC-010]
---

# Replace progress-bar pulse with a shimmer/wave animation

## Context

The running task's progress bar pulses (opacity blink). A left-to-right
shimmer/wave would better convey forward momentum, matching the app's coaching tone
([SPEC-001]). Migrated from `conductor/backlog.md` (TK-001).

## Acceptance criteria

- [ ] The active progress bar animates with a left-to-right shimmer instead of
      pulsing.
- [ ] Paused/overtime/done states keep their current styling semantics.
- [ ] SPEC-010 is updated if it describes the animation.
