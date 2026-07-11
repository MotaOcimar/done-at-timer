---
id: TK-031
title: Delete routines via swipe, like tasks
type: feature
status: in-progress
specs: [SPEC-009, SPEC-011, SPEC-012]
---

# Delete routines via swipe, like tasks

## Context

Tasks are deleted by swiping the card right-to-left to reveal a delete button
([SPEC-009]); routines in the library ([SPEC-011], Control Center [SPEC-012]) are
deleted through an always-visible delete button on each row. User request
(2026-07-11): make routine deletion the same swipe gesture — it frees space on the
row and keeps the interaction consistent with the rest of the app.

## Design

- **No confirmation dialog after the swipe** (decided with the user, 2026-07-11).
  The gesture is already a two-step deletion: the swipe reveals the button —
  signalling the user is entering a delete action — and the deliberate tap on it
  confirms the intent, with a natural moment to reconsider in between. This is the
  widespread mobile pattern and matches task deletion ([SPEC-009]), which has no
  dialog either. The current routine-delete confirmation modal is removed.
- **Structure:** the routine row moves into its own `RoutineItem` component
  (mirroring `TaskItem`) because the swipe hook (`useSwipeToReveal`) is
  per-item. Reuses the hook and the reveal-area pattern as-is; no dnd-kit
  complications (routines aren't reorderable).
- **Keyboard fallback:** Delete key with the routine row focused, same as tasks
  ([SPEC-009]).
- Out of scope: any change to the expansion preview (TK-009) or share.

## Plan

- [ ] Red: `RoutineItem` wiring tests (mocked hook — reveal button behind,
      revealed/hidden accessibility states, drag props applied) and updated
      `ControlCenter` tests (delete via revealed button is immediate, no
      confirmation modal, Delete key fallback).
- [ ] Green: extract `RoutineItem`, wire `useSwipeToReveal` + shared
      `activeSwipeId`, remove the visible delete button and the confirmation
      modal.
- [ ] Full suite + lint + format.
- [ ] Update SPEC-009, SPEC-011, SPEC-012.
- [ ] Self-check on the running app; move to `in-review`. (The drag gesture
      itself cannot be driven in the frame-less headless environment — verify
      the keyboard path end-to-end and rely on the hook's existing coverage +
      manual acceptance for the gesture.)

## Acceptance criteria

- [ ] Swiping a routine row right-to-left reveals a delete button, with the same
      gesture semantics as tasks (commit threshold, quick flick, at most one row
      revealed at a time, haptic pulse where supported).
- [ ] The always-visible delete button is removed from the routine row.
- [ ] Deletion is not gesture-only — a keyboard/accessible fallback exists, as with
      tasks.
- [ ] SPEC-011 (and SPEC-009 or SPEC-012 as appropriate) updated to cover how
      routines are deleted.
