# Specification: Polish & Consistency Refinement

## 1. Overview
A track dedicated to technical debt (dead CSS), bug fixes (z-index, spin buttons), and UI standardization (border-radius, padding, shadows, typography, transitions, and completed task styling).

## 2. Functional Requirements
- **Cleanup:** Delete `App.css` (boilerplate Vite) and remove its references in `App.tsx` and `main.tsx`.
- **Z-Index Fix:** Fix `ArrivalDisplay` z-index so it stays below modals/drawers but above the task list.
- **Input Polishing:** Hide spin buttons in numeric minute inputs across the app.
- **UI Standardization:**
    - Standardize `border-radius` (e.g., Buttons: `rounded-xl`, Cards: `rounded-2xl`).
    - Standardize button `padding` (e.g., `py-2.5` as default).
    - Standardize `shadows` for consistent depth.
    - Standardize `typography` (replace `tracking-widest` with `tracking-wide`).
- **Smooth Transitions:** Replace jarring `scale` transitions with smooth color/opacity changes. Use "Fast & Snappy" duration (150-200ms).
- **Completed Task Style:** Use a muted color palette (e.g., slate/gray) instead of `opacity-70` for better accessibility and readability.

## 3. Non-Functional Requirements
- **Accessibility:** Ensure the new "Completed" state passes WCAG AA contrast ratios.
- **Consistency:** Mobile UI must adhere to the same standards.
- **TDD:** Ensure styles are verified through tests where appropriate.

## 4. Acceptance Criteria
- `App.css` file deleted and no imports left.
- `ArrivalDisplay` no longer overlaps modals.
- No spin buttons visible on desktop browsers for minute inputs.
- `tailwind.config.ts` (or equivalent in Tailwind v4) updated with standardized UI theme extensions.
- All buttons and cards follow the new border-radius and shadow standards.
- Completed tasks are readable and clearly "done".
- Transitions feel professional and responsive.

## 5. Out of Scope
- Major architectural changes or new features.
- Backend/Storage logic changes.
