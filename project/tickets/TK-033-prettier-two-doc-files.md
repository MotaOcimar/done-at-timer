---
id: TK-033
title: Make npm run check pass again — Prettier two doc files
type: chore
status: done
specs: []
---

# Make npm run check pass again — Prettier two doc files

## Context

`npm run check` fails on `project/specs/SPEC-006-arrival-display.md` and
`project/tickets/TK-029-icon-meaning-tooltip.md`, committed before TK-009's
work started. Same spirit as TK-022: keep the whole repo Prettier-clean.
Formatting only — no content changes. Trivial chore: no Design/Plan, exempt
from the acceptance gate.
