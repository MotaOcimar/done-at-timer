# Specification: Polish & Consistency Refinement

## 1. Overview
A track dedicated to cleaning up dead code, fixing visual bugs, and standardizing the UI design tokens (border-radius, shadows, button sizing, typography, transitions, and completed-task styling) for a cohesive, polished feel.

## 2. Functional Requirements

### 2.1 Cleanup: Delete Dead `App.css`
- Delete `src/App.css` entirely. It contains only Vite boilerplate (`.logo`, `.card`, `.read-the-docs`, `@keyframes logo-spin`) — none of it is used.
- **Note:** There are NO imports of `App.css` anywhere in the codebase (verified via grep). Just delete the file.

### 2.2 Bug Fix: Arrival Clock Z-Index
The sticky header (`App.tsx:25`) uses `z-50`. The RoutineManager backdrop uses `z-40`, and the drawer/modals use `z-50`/`z-[60]`. This means the ArrivalDisplay bleeds through the backdrop and remains visible above overlays.

**Fix:** Lower the sticky header z-index to `z-30` so it layers correctly:
- `z-30` — Sticky header (ArrivalDisplay)
- `z-40` — Backdrop overlay
- `z-50` — Drawer / modals
- `z-[60]`/`z-[70]` — Nested confirmation modals (already correct)
- `z-[100]` — PWAUpdateNotification (already correct)

### 2.3 Bug Fix: Hide Spin Buttons on Number Inputs
On desktop browsers, `<input type="number">` shows spin buttons (up/down arrows) that obscure the value.

**Affected:** Only `TaskInput.tsx:33` — the new-task duration input. The `InlineEdit` component (`InlineEdit.tsx:80`) already avoids this by using `type="text"` with `inputMode="numeric"`.

**Fix:** Add a global CSS rule in `index.css` to hide spin buttons on `type="number"` inputs:
```css
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
```

### 2.4 Standardize Border Radius
Current state is chaotic — 4 different radius values used inconsistently across components. Standardize to a 2-tier system plus `rounded-full`:

| Element Type | Current (mixed) | Target |
|---|---|---|
| Circular elements (StatusIcon, NotificationBell, ProgressBar) | `rounded-full` | `rounded-full` (keep) |
| Small elements (buttons, inputs, icon boxes, toasts/prompts) | `rounded-lg` / `rounded-xl` | `rounded-xl` |
| Large containers (cards, modals, ArrivalDisplay, empty states) | `rounded-2xl` / `rounded-3xl` | `rounded-2xl` |

**Components to update:**
- `ArrivalDisplay.tsx`: `rounded-3xl` -> `rounded-2xl` (2 occurrences: main container + completion state)
- `RoutineManager.tsx`: `rounded-3xl` -> `rounded-2xl` (save modal, load modal, delete modal, empty state)
- `InstallPrompt.tsx`: `rounded-lg` -> `rounded-xl` (icon box, install button)
- `PWAUpdateNotification.tsx`: `rounded-lg` -> `rounded-xl` (icon box, reload button, close button)

### 2.5 Standardize Shadows
Current shadow usage is inconsistent. Standardize to a clear depth hierarchy:

| Depth Level | Shadow Class | Usage |
|---|---|---|
| Resting cards | `shadow-sm` | TaskCard (keep) |
| Hover elevation | `shadow-md` | RoutineManager items on hover (keep) |
| Floating UI (toasts, prompts) | `shadow-xl` | InstallPrompt, PWAUpdateNotification |
| Hero / overlays | `shadow-2xl` | ArrivalDisplay (running), RoutineManager drawer/modals |

**Components to update:**
- `InstallPrompt.tsx`: `shadow-2xl` -> `shadow-xl`
- `InstallPrompt.tsx` button: remove `shadow-lg shadow-blue-500/30` (excessive for a small button)
- `TaskInput.tsx` add button: `shadow-lg shadow-blue-100` -> `shadow-md shadow-blue-100`
- `TaskList.tsx` reset button: `shadow-lg shadow-green-50` -> `shadow-md shadow-green-50`

### 2.6 Standardize Typography (Letter Spacing)
Current tracking values are excessive and inconsistent. Standardize:

| Context | Current (mixed) | Target |
|---|---|---|
| Small uppercase labels | `tracking-widest` / `tracking-[0.2em]` | `tracking-wide` |
| Uppercase header buttons (Load/Save/Clear) | `tracking-tighter` | `tracking-wide` (match labels) |
| Numbers / time displays | `tracking-tighter` / `tracking-tight` | `tracking-tight` (keep) |
| "Done" button | `tracking-widest` | `tracking-wide` |

**Components to update:**
- `TaskCard.tsx:253`: `tracking-widest` -> `tracking-wide`
- `TaskList.tsx:115`: `tracking-widest` -> `tracking-wide`
- `TaskList.tsx:122,133,144`: `tracking-tighter` -> `tracking-wide`
- `RoutineManager.tsx:138`: `tracking-widest` -> `tracking-wide`
- `ArrivalDisplay.tsx:61,148`: `tracking-[0.2em]` -> `tracking-wide`
- `ArrivalDisplay.tsx:168`: `tracking-widest` -> `tracking-wide`

### 2.7 Smooth Transitions
Remove jarring scale transforms and replace with smoother alternatives:

| Component | Current | Target |
|---|---|---|
| TaskCard "Done" button (overtime) | `scale-110` | Remove scale; rely on color/shadow change |
| TaskList "Clear All" (confirming) | `scale-105` | Remove scale; rely on color change + width transition |
| InstallPrompt install button | `active:scale-95` | Keep (subtle press feedback is fine) |

### 2.8 Completed Task Styling
The current `opacity-70` on the entire completed card weakens all content including the ETA time, hurting readability.

**Replace with:** A muted color approach — desaturated/gray colors on text and borders instead of global opacity reduction. The card should look clearly "done" without sacrificing readability.

Current (`TaskCard.tsx:151`): `'border-green-100 bg-green-50/50 opacity-70'`
Target: `'border-gray-200 bg-gray-50 text-gray-400'` (remove `opacity-70`, use explicit muted colors)

Also update related class maps (`titleClasses.completed`, `labelClasses.completed`, `timeDisplayClasses.completed`) to use consistent gray tones.

## 3. Non-Functional Requirements
- **Accessibility:** Completed task text must pass WCAG AA contrast ratio (4.5:1 for normal text).
- **Consistency:** Mobile and desktop must follow the same token system.
- **No regressions:** All existing tests must continue to pass. Update test selectors/assertions if class names change.

## 4. Acceptance Criteria
- [ ] `src/App.css` deleted, no references anywhere.
- [ ] Sticky ArrivalDisplay stays below RoutineManager backdrop/drawer/modals.
- [ ] No spin buttons visible on desktop browsers for duration inputs.
- [ ] All border radii follow the 2-tier system (`rounded-xl` for small, `rounded-2xl` for large).
- [ ] Shadows follow the defined depth hierarchy.
- [ ] All uppercase labels use `tracking-wide` consistently.
- [ ] No jarring `scale-110` / `scale-105` transitions remain.
- [ ] Completed tasks are readable without global opacity reduction.
- [ ] All existing tests pass (updated where necessary).

## 5. Out of Scope
- New features or functionality changes.
- Color palette changes (overtime amber, etc.).
- Dark mode.
- Animation library integration.
- Backend/storage logic.
