---
id: SPEC-009
title: Swipe to delete (touch)
status: implemented
links: [SPEC-004]
---

# Swipe to delete

- Swiping a task card right-to-left reveals a delete button behind it.
- The reveal **commits** when the swipe goes past roughly half the button's width, or
  on a quick flick; otherwise the card snaps back.
- A short haptic pulse marks the commit threshold (on devices that support
  vibration).
- **At most one card is revealed at a time** — swiping another card dismisses the
  previous one.
- Deleting the running task behaves like skipping it ([SPEC-004]).

## Implementation pointers
- `src/hooks/useSwipeToReveal.ts`, `src/components/TaskItem.tsx`

## Log
- Seeded from code + conductor archive (2026-07-02)
