---
id: TK-009
title: Expand routine in the library to preview its tasks
type: feature
status: in-progress
specs: [SPEC-011, SPEC-012]
---

# Expand routine in the library to preview its tasks

## Context

The routine library ([SPEC-011], surfaced in the Control Center [SPEC-012]) lists
routines by name only — the user must load one to see what's inside. Clicking a
routine should expand it in place to preview its task list. Migrated from
`conductor/backlog.md` (TK-001).

Refined with the user (2026-07-11): the preview expands **inline in the list**, not
in a modal. Today tapping a routine loads it directly (after confirmation); this
ticket intentionally changes that — tap expands, and loading happens from inside
the expanded view. The chevron icon each routine already shows becomes the
expansion affordance: it rotates when the routine expands/collapses. Delete moved
out of scope — routine deletion becomes a swipe gesture in TK-031.

## Acceptance criteria

- [ ] Tapping a routine (or its chevron) expands it in place, showing its tasks
      (names and durations) without loading it; tapping again collapses it.
- [ ] The chevron rotates to reflect the expanded/collapsed state.
- [ ] The expanded view offers the load action; the existing confirmation when the
      current list is non-empty is preserved.
- [ ] No modal is involved in previewing.
- [ ] SPEC-011 (and SPEC-012 if the Control Center layout changes) are updated.

## Design

Interaction decided with the user (2026-07-11, see Context): inline expansion, no
modal, rotating chevron, load moves inside the expanded view. Remaining details
proposed directly (single obvious answers, open to veto):

- **Accordion: at most one routine expanded at a time** — expanding one collapses
  the previous. Matches the "at most one revealed" convention of swipe-to-delete
  ([SPEC-009]) and keeps the list calm.
- **The whole row toggles expansion** (not only the chevron) — the chevron rotates
  90° down as the visual affordance. The row exposes its state accessibly
  (`aria-expanded`).
- **Expanded content**: the routine's tasks in order, each with name and estimate,
  plus a single **"Load routine"** action ("load" is the app's established verb —
  SPEC-011, the "Yes, Load" confirmation). Share/delete row actions are untouched.
- **Load flow unchanged** ([SPEC-011]): from the expanded view, load applies
  immediately when the current list is empty, otherwise asks the existing
  replacement confirmation; a successful load closes the drawer.
- Out of scope: routine deletion changes (TK-031), the finish-time forecast
  (TK-032 adds it to this expanded view later).

## Plan

- [ ] Write the failing tests: tap expands (no load, no confirmation), tap again
      collapses, accordion, chevron rotation + `aria-expanded`, load button
      behavior (empty list → immediate; non-empty → confirmation); adapt the
      existing load-by-tap tests to the new flow.
- [ ] Implement the inline expansion in `ControlCenter.tsx` until green.
- [ ] Full test run + lint + format.
- [ ] Update SPEC-011 and SPEC-012.
- [ ] Self-check on the running app (drive the flow, screenshot) and move to
      `in-review`.
