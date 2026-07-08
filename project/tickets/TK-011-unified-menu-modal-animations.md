---
id: TK-011
title: Unify entry/exit animations for menus and modals
type: chore
status: open
specs: []
---

# Unify entry/exit animations for menus and modals

## Context

Menus and modals (Control Center, save-routine dialog, confirmation prompts) have
inconsistent or missing entry/exit transitions. Framer Motion is already a
dependency (used for swipe-to-delete in the task cards), so this is about extending
it to all overlay surfaces, not adding a library. Migrated from
`conductor/backlog.md` (TK-001) — the original item predated Framer Motion's
adoption.

## Acceptance criteria

- [ ] All menus/modals/overlays animate in and out consistently (same motion
      language, durations, easing).
- [ ] No behavior change beyond the transitions — existing specs remain accurate.
