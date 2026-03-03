# Specification: UI Color Palette Refinement

## 1. Overview
This track addresses the "UI Color Palette Refinement" priority improvement listed in the backlog. The goal is to update the colors used for specific states (Overtime, Paused, and Idle/Pending) to create a more pleasant, neutral, and consistent user experience, moving away from overly alarming or confusing colors.

## 2. Functional Requirements

### Softer Overtime Color
- Replace the current heavy amber palette (`amber-500/600/700`) with a softer, warmer tone.
- Suggested candidates: `amber-400` for borders/rings, `amber-300` for backgrounds, or shift to a warm `yellow-500/400` palette.
- The overtime state should still be visually distinct from the active state, but feel less "alarming" — maintaining the app's positive coaching vibe.
- The progress bar should also reflect the overtime color instead of remaining blue.

### Neutral Paused State
- Replace the current blue palette (`bg-blue-100 text-blue-600`) used when an active task is paused with a neutral gray tone.
- Suggested candidates: `bg-gray-100 text-gray-500` for the status icon, `border-gray-300 bg-gray-50` for the card.
- Pausing is an intentional, neutral action — the color should reflect that, not reuse the "active" blue.
- The progress bar should also use a neutral gray when paused instead of remaining blue.

### Neutral Idle State
- Replace the current blue palette (`bg-blue-50 text-blue-500`) on the play button for pending/idle tasks with a neutral color.
- Suggested candidates: `bg-gray-100 text-gray-400` with `hover:bg-blue-50 hover:text-blue-500` (blue only on hover to hint at the action).
- Tasks that haven't started should not visually compete with the active task for attention.

## 3. Non-Functional Requirements
- **No regressions**: Color changes must not affect the Active (running) or Completed states, which remain blue and green respectively.
- **Accessibility**: New color choices must maintain sufficient contrast ratios (WCAG AA minimum).
- **Consistency**: All visual elements of a given state (card border, background, text, icon, progress bar) must use the same color family.
- **Tailwind only**: All colors must use standard Tailwind CSS utility classes — no custom CSS or hardcoded hex values.

## 4. Affected Components
Based on current codebase analysis:
- `TaskCard.tsx` — Card background & border (lines ~131-137)
- `TaskCard.tsx` — StatusIcon component (lines ~29-98) — play button, pause icon
- `TaskCard.tsx` — Task title text color (lines ~166-168)
- `TaskCard.tsx` — Duration label color (lines ~175-177)
- `TaskCard.tsx` — Done button color for overtime (lines ~198-202)
- `TaskCard.tsx` — Time display color (lines ~226-228)
- `ProgressBar.tsx` — Bar fill color (currently fixed `bg-blue-500`, line ~18) — must become state-aware

## 5. Reproduction Steps / Context
As specified in the backlog:
1. **Overtime State:** Start a timer and let it run past zero. Observe the current heavy amber color.
2. **Paused State:** Start a timer and pause it. Observe the current color of the active task — it stays blue, same as running.
3. **Idle State:** Look at a pending task in the list. Observe the play button's blue color, same as the active state.

## 6. Acceptance Criteria
- [ ] **Overtime Color:** The overtime state uses a softer, more pleasant color instead of the previous heavy amber.
- [ ] **Paused Color:** When a task is paused, its visual representation uses a neutral gray color, clearly distinct from the running (blue) state.
- [ ] **Idle Color:** The play button and any associated indicators for pending/idle tasks use neutral colors, not the active blue color.
- [ ] **Active/Completed Unchanged:** The running (blue) and completed (green) states remain visually unchanged.
- [ ] **Progress Bar:** The progress bar color matches the current task state (blue when running, gray when paused, softer tone when in overtime).
- [ ] **Visual & Functional Check:** The color changes are visually correct, accessible, and do not introduce any functional regressions.

## 7. Out of Scope
- Other backlog items (e.g., Z-index Bug, Minutes Input Bug, Sticky Arrival Time).
- Major structural UI changes outside of color refinements for the specified states.
- Dark mode considerations.
