# Specification: UI Color Palette Refinement

## Overview
This track addresses the "UI Color Palette Refinement" priority improvement listed in the backlog. The goal is to update the colors used for specific states (Overtime, Paused, and Idle/Pending) to create a more pleasant, neutral, and consistent user experience, moving away from overly alarming or confusing colors.

## Scope
- Modify the color used when a task is in "Overtime" to a softer, less alarming tone than the current heavy amber.
- Update the color of the active task when it is "Paused" to a neutral color (e.g., gray).
- Ensure tasks that haven't been started yet (Pending/Idle state) use neutral colors. Specifically, the play button should not use an active color (blue) when not running.

## Out of Scope
- Other backlog items (e.g., Z-index Bug, Minutes Input Bug, Sticky Arrival Time).
- Major structural UI changes outside of color refinements for the specified states.

## Reproduction Steps / Context
As specified in the backlog:
1. **Overtime State:** Start a timer and let it run past zero. Observe the current heavy amber color.
2. **Paused State:** Start a timer and pause it. Observe the current color of the active task.
3. **Idle State:** Look at a pending task in the list. Observe the play button's color.

## Acceptance Criteria
- [ ] **Overtime Color:** The overtime state uses a softer, more pleasant color instead of the previous heavy amber.
- [ ] **Paused Color:** When a task is paused, its visual representation uses a neutral color like gray.
- [ ] **Idle Color:** The play button and any associated indicators for pending/idle tasks use neutral colors, not the active blue color.
- [ ] **Visual & Functional Check:** The color changes are visually correct and do not introduce any functional regressions.