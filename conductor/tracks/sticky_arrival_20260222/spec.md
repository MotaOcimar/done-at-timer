# Track: Sticky Arrival Time

## Overview
This track implements a sticky behavior for the `ArrivalDisplay` component. The goal is to ensure that the "Arrival Time" (the application's core value proposition) remains visible at the top of the screen at all times, even when the user scrolls through a long list of tasks.

## Functional Requirements
- **Permanent Visibility**: The `ArrivalDisplay` component must remain fixed at the top of the viewport.
- **Full Card Rendering**: The display will maintain its full appearance (ETA, progress bar, and "drifting" status) rather than switching to a compact version.
- **Read-Only Mode**: The sticky display will remain informational, without new interactive buttons for task control in this phase.
- **Layout Integrity**: The `TaskList` and `TaskInput` must scroll correctly underneath the fixed display without being obscured or creating "dead space" at the top.

## Non-Functional Requirements
- **Performance**: Scrolling should remain smooth (60fps) without layout jank or flickering.
- **Accessibility**: Ensure the fixed element doesn't break keyboard navigation or screen reader flow.
- **Styling**: Use `sticky top-0` and `z-index` for a robust, modern implementation.

## Acceptance Criteria
- [ ] The `ArrivalDisplay` stays at the top of the screen when the page is scrolled.
- [ ] Task items in the `TaskList` visibly pass underneath the `ArrivalDisplay`.
- [ ] The `ArrivalDisplay` does not overlap or hide the `TaskInput` when it's at the bottom of the list.
- [ ] No visual regressions in the `ArrivalDisplay` component's styling or responsiveness.

## Out of Scope
- Compact/Mini version of the arrival display.
- Adding task controls (Pause/Done) to the sticky bar.
