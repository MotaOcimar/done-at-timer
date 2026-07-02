---
id: TK-012
title: Quick-complete a task without starting it
type: feature
status: open
specs: [SPEC-004, SPEC-010]
---

# Quick-complete a task without starting it

## Context
Today a task can only become done through the completion flow of a running task
([SPEC-004]). Users often finish something out of band ("already brushed my teeth")
and want to check it off directly from the list without playing it. Migrated from
`conductor/backlog.md` (TK-001).

## Acceptance criteria
- [ ] A to-do task's card offers a way to mark it done directly, without it ever
      running.
- [ ] The arrival time and list ordering react exactly as if the task had completed
      normally ([SPEC-002], [SPEC-005]).
- [ ] SPEC-004 and SPEC-010 are updated.

## Notes
Design should decide how a never-run task's "actual duration" is displayed (the
done card normally shows actual vs estimated, [SPEC-010]).
