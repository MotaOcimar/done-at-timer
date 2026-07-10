---
id: TK-029
title: Reveal each state icon's meaning to sighted users via an accessible tooltip
type: feature
status: done
specs: [SPEC-006]
---

# Reveal each state icon's meaning to sighted users via an accessible tooltip

## Context

TK-005/TK-027 made the arrival state signal icon-only (pin = locked, analog clock =
drifting). The meaning currently lives only in the `aria-label`, so a sighted user not
running a screen reader has no way to learn what the icon means. User feedback: surface
a short description on interaction.

## Acceptance criteria

- [ ] Interacting with the arrival clock reveals a short text naming it as the
      estimated arrival time, and noting when that estimate is slipping — in plain,
      non-alarming language (no "late").
- [ ] Works on touch (tap to reveal/dismiss) and on desktop (hover), and on keyboard
      (focus) — the primary target is mobile.
- [ ] The description is a single source of truth, shared with the icon's accessible
      label (no duplicated/￼diverging strings).
- [ ] Doesn't clutter the calm, minimalist header when idle (only shows on demand).
- [ ] SPEC-006 updated (and SPEC-010 if the task icons are included — see Design).

## Design

Recommended approach (the conventional pattern for icon-only UIs, offered to the user):
an **accessible tooltip** on the state icon — shown on hover + focus + tap, with the
tooltip text reused as the icon's accessible description. Native `title` was rejected
(hover-only, useless on this mobile-first PWA's touch target).

Scope (closed with the user): **arrival header icon only**, via a **reusable**
`IconTooltip` component so the task icons (TK-028) can adopt it later in a follow-up.

Implementation decisions:

- `IconTooltip` wraps the icon in a `<button>` (focusable/tappable, accessible). The
  icon keeps its own `aria-label` (so the button is named by it — screen-reader
  behavior unchanged); the visible bubble is `aria-hidden` and duplicates that same
  string, so there is one source of truth (`stateLabel`) used for both.
- Reveal on **tap** (click toggles a state), plus **hover** and **keyboard focus**
  via CSS (`group-hover`, `group-focus-visible`). `focus-visible` (not `focus`) so a
  pointer tap doesn't get stuck open. Blur closes the tapped-open state.
- No new dependency, no new CSS file — Tailwind utilities only.

Out of scope: the task card's overtime clock (follow-up ticket); tooltips on unrelated
icons/buttons; custom collision-aware positioning (bubble sits below the icon).

## Revision (2026-07-10, in-review feedback)

During acceptance the user reshaped the copy and the anchor (design decision taken
together):

- **Copy**: "Arrival time is locked / drifting" was too metaphorical, and "late"-type
  wording risks anxiety for the time-blindness audience. The clock is really an
  *estimate*, so the text now **names it**: `Estimated arrival time`, and
  `Estimated arrival time — slipping` when drifting. Neutral verbs only, no "late".
- **Anchor**: since the text names the number (not the icon's shape), the tooltip moved
  from the small state icon to the **whole clock group** (time + icon). The state icon
  is now decorative (`aria-hidden`) reinforcement.
- **A11y**: the bubble is the group's `aria-describedby`, so the time stays the
  accessible *value* and the meaning rides along as a *description* (never overriding
  the number). `IconTooltip` and `AnalogClock` updated accordingly (the clock gained an
  `aria-hidden` decorative mode).

## Plan

- [x] Red: `IconTooltip.test.tsx` — renders child; bubble hidden initially; a click
      reveals it and a second click hides it.
- [x] Build `src/components/IconTooltip.tsx` (button wrapper + aria-hidden bubble,
      tap state + hover/focus-visible via CSS).
- [x] Wrap the arrival state icon in `IconTooltip` in `ArrivalDisplay.tsx`, feeding
      one `stateLabel` to both the icon `aria-label` and the tooltip.
- [x] Update the TK-027 placement test (icon's positioned ancestor) and add a test
      that tapping the icon reveals its description.
- [x] Update SPEC-006 + Log. Green: suite (298 passing), lint, build, prettier.
- [x] Accepted in-review by the user on the running app → `done` + commit.

## Acceptance

Accepted by the user on the running app (2026-07-10): tapping the arrival clock
(time + pin/clock icon) reveals "Estimated arrival time" (or "— slipping" when
drifting) as a bubble; hover/focus also reveal it. Suite green (299 passing), lint,
build, prettier all clean.
