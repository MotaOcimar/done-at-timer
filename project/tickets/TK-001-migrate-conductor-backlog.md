---
id: TK-001
title: Migrate conductor backlog into tickets
type: chore
status: done
specs: []
---

# Migrate conductor backlog into tickets

## Context

`conductor/backlog.md` holds ~15 open items (features, ideas, tech debt) from the
previous planning system. The conductor directory is now frozen; open work should
live here as tickets so it can cite specs by ID.

## Acceptance criteria

- [x] Every unchecked item in `conductor/backlog.md` either becomes a ticket
      (feature/idea/chore as appropriate, citing the specs it touches) or is
      consciously dropped.
- [x] Items already migrated as examples (TK-002 per-task progress → "Technical
      Debt"; TK-003 device sync research → "Cross-Device") are not duplicated.
- [x] `conductor/backlog.md` gains a header note pointing to `project/tickets/`.

## Notes

Migrate lazily if preferred — an item can be converted the moment someone wants to
work on it. This ticket is done when nothing actionable lives only in the old file.

### Migration record (2026-07-02)

Every unchecked backlog item was verified against the current code/specs before
deciding. **Migrated** → TK-005 (arrival status icons), TK-006 (media-style
notifications), TK-007 (paused time tracking), TK-008 (mini time timers), TK-009
(routine list expansion), TK-010 (dark mode), TK-011 (unified menu/modal
animations), TK-012 (quick complete), TK-013 (auto-advance toggle), TK-014
(automated visual docs), TK-015 (progress shimmer), TK-016 (routine chaining),
TK-017 (routine edit-in-place), TK-018 (translate useTimer comments), TK-019
(unified timer architecture).

**Consciously dropped** (unchecked in the backlog but already resolved — the
frozen file was stale):

- _Full Card Drag and Drop_: implemented by the `task_interaction_refinement`
  conductor track; whole-card drag with no handle is current behavior (SPEC-007).
- _Swipe to Delete_: implemented by the same track (SPEC-009).
- _Notification Bell Placement_: the `NotificationBell` component no longer exists;
  the notification toggle lives in the Control Center (SPEC-012, SPEC-014), which
  resolves the original complaint (permanent header space for a one-time action).
- _Centralized Project Specs Directory_: realized by this very system —
  `project/specs` + `project/tickets` (introduced in commit a9ff300) match the
  proposal's living-specs / frozen-tickets split.

**Not duplicated** (already tickets): per-task progress persistence → TK-002;
routine sync/sharing → TK-003.
