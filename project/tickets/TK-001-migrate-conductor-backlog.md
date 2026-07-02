---
id: TK-001
title: Migrate conductor backlog into tickets
type: chore
status: open
specs: []
---

# Migrate conductor backlog into tickets

## Context
`conductor/backlog.md` holds ~15 open items (features, ideas, tech debt) from the
previous planning system. The conductor directory is now frozen; open work should
live here as tickets so it can cite specs by ID.

## Acceptance criteria
- [ ] Every unchecked item in `conductor/backlog.md` either becomes a ticket
      (feature/idea/chore as appropriate, citing the specs it touches) or is
      consciously dropped.
- [ ] Items already migrated as examples (TK-002 per-task progress → "Technical
      Debt"; TK-003 device sync research → "Cross-Device") are not duplicated.
- [ ] `conductor/backlog.md` gains a header note pointing to `project/tickets/`.

## Notes
Migrate lazily if preferred — an item can be converted the moment someone wants to
work on it. This ticket is done when nothing actionable lives only in the old file.
