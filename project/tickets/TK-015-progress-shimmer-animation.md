---
id: TK-015
title: Replace progress-bar pulse with a shimmer/wave animation
type: feature
status: done
specs: [SPEC-006, SPEC-010]
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

## Design

Decisions closed with the user (2026-07-08):

- **Shimmer style: flowing gradient wave.** Instead of a subtle sheen or a
  leading-edge glow, the running fill carries a repeating translucent stripe
  gradient that scrolls left→right continuously over the solid state color. It
  reads as forward flow, matching the coaching tone ([SPEC-001]). The solid
  state color stays underneath, so per-state palette semantics are untouched.
- **Scope: both bars.** The task-card progress bar ([SPEC-010]) _and_ the
  arrival-header progress bar ([SPEC-006]) pulse today with the same "active"
  meaning (`animate-pulse` gated on running-and-not-drifting). Both switch to the
  shimmer so they stay consistent. SPEC-006 is therefore added to this ticket's
  specs.

Settled by codebase convention (proposed, open to veto):

- The animation is defined in `src/index.css` as a plain `.shimmer` utility class
  - `@keyframes shimmer` (Tailwind v4, `@theme` lives here; no `tailwind.config`).
    The class layers a `background-image` stripe gradient + `animation` over the
    existing `bg-*` state color and is applied via the existing `isActive` gate that
    used to add `animate-pulse` — one class swap per bar.
- Specs gain one implementation-agnostic line each (the running bar shows
  continuous forward motion signaling live progress); the stripe/CSS detail stays
  out of the specs.

Out of scope: `prefers-reduced-motion` handling (the current pulse ignores it
too; a separate accessibility ticket can address motion globally), and the
overtime clock-text pulse in `TaskCard.tsx` (unrelated to the progress bar).

## Plan

- [x] RED: update `ProgressBar.test.tsx` "renders … when active" to expect the
      `shimmer` class (present when active, absent when inactive); confirm it fails.
- [x] GREEN: add `.shimmer` utility + `@keyframes shimmer` to `src/index.css`.
- [x] GREEN: swap `animate-pulse` → `shimmer` in `ProgressBar.tsx` (active gate).
- [x] GREEN: swap `animate-pulse` → `shimmer` in `ArrivalDisplay.tsx` (active gate);
      confirm the whole suite is green (282 passing).
- [x] Update SPEC-010 and SPEC-006 (one behavioral line + Log entry each).
- [x] Verify: `npm run lint` clean, `npm run check` clean, `npm run build` OK;
      `.shimmer` + `@keyframes shimmer` confirmed emitted in `dist` CSS.
- [x] Close: check the boxes, set status `done`, update `tickets/INDEX.md`.
