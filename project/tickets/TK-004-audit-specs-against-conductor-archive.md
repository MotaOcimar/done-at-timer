---
id: TK-004
title: Audit specs against the conductor archive
type: chore
status: done
specs: [SPEC-001, SPEC-007, SPEC-008, SPEC-009, SPEC-015, SPEC-016]
---

# Audit specs against the conductor archive

## Context
The 16 seed specs were written in one pass from code + archive (see their Log
lines), so they deserve a verification pass. This audit read all 19 archived
conductor tracks chronologically and cross-checked every behavioral claim against
the current specs, confirming divergences in the code before editing anything.

## Acceptance criteria
- [x] Every archived track's spec read; every suspected divergence verified in code.
- [x] Specs corrected/complemented; each edited spec gains a Log line citing TK-004.

## Design
- The archive records *intent at the time*; where a track's stated target was
  superseded during its own implementation, the code is the tiebreaker. Example:
  the polish track (2026-03-07) targeted gray completed cards, but the shipped
  styling is soft green — SPEC-010 already matched the code, so no change.
- Out of scope: re-verifying browser-specific PWA quirks (Brave install detection)
  beyond what is observable in the code.

## Notes
**Corrections** (spec contradicted reality):
- SPEC-007: known-limitation was stale — the drag handle was removed and whole-card
  dragging implemented by track `task_interaction_refinement_20260313`.
- SPEC-016: tests do not use jsdom (node default + happy-dom per-file), and
  `npm test` type-checks before running the suite.

**Complements** (behavior defined in tracks, verified in code, missing from specs):
- SPEC-001: "focus over discoverability" design principle
  (`unified_sidebar_menu_20260309` §1.1).
- SPEC-008: save/cancel/validation rules for inline editing.
- SPEC-009: completed tasks excluded from swipe/individual delete; keyboard fallback.
- SPEC-015: installed state detected even in a plain browser tab; "unavailable" state.

All other specs (SPEC-002..006, SPEC-010..014) were confirmed against the tracks
with no change needed.
