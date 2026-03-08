# Implementation Plan: Polish & Consistency Refinement

## Methodology Note: TDD vs. Manual Verification

TDD applies to **behavioral** changes where a test can verify intent (z-index layering, completed-task readability). Pure **visual** CSS token swaps (border-radius, shadows, letter-spacing, scale) cannot be meaningfully validated by JSDOM — writing `expect(el).toHaveClass('rounded-2xl')` is brittle, tests implementation not behavior, and adds no safety. These are verified manually.

---

## Phase 1: Cleanup and Bug Fixes

### [x] 1.1 Delete `src/App.css` (851fb2a)
- Delete the file. No imports exist anywhere — verified via grep.
- Run `npm run build` to confirm no breakage.

### 1.2 Fix sticky header z-index (TDD)
**Existing test:** `integration.sticky.test.tsx:21` asserts `z-50`.

- **Red:** Update test assertion from `z-50` to `z-30`. Run test — fails.
- **Green:** In `App.tsx:25`, change `z-50` to `z-30`. Run test — passes.
- **Refactor:** None needed.

### 1.3 Hide spin buttons on number inputs
- Add CSS rule to `src/index.css` (after `@import 'tailwindcss'` and `@theme` block):
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
- Only `TaskInput.tsx:33` is affected. `InlineEdit` already uses `type="text"` with `inputMode="numeric"`.
- **No test:** JSDOM doesn't render pseudo-elements. Manual verification only.

### 1.4 Conductor: Manual Verification — Phase 1
- Verify `App.css` is gone and build succeeds.
- Verify ArrivalDisplay stays below RoutineManager backdrop/drawer/modals (open library, open save modal — arrival clock should be hidden behind overlay).
- Verify no spin buttons on the duration input in TaskInput (desktop Chrome/Firefox).

---

## Phase 2: Design Token Standardization

All tasks in this phase are pure visual CSS class swaps. No behavioral tests — manual verification at end of phase.

### 2.1 Standardize border radius
Target system: `rounded-xl` (small: buttons, inputs, icon boxes, toasts) / `rounded-2xl` (large: cards, modals, ArrivalDisplay).

Changes:
- `ArrivalDisplay.tsx:46` — completion state: `rounded-3xl` -> `rounded-2xl`
- `ArrivalDisplay.tsx:145` — main container: `rounded-3xl` -> `rounded-2xl`
- `RoutineManager.tsx:80` — save modal: `rounded-3xl` -> `rounded-2xl`
- `RoutineManager.tsx:140` — empty state: `rounded-3xl` -> `rounded-2xl`
- `RoutineManager.tsx:185` — load modal: `rounded-3xl` -> `rounded-2xl`
- `RoutineManager.tsx:216` — delete modal: `rounded-3xl` -> `rounded-2xl`
- `InstallPrompt.tsx:16` — icon box: `rounded-lg` -> `rounded-xl`
- `InstallPrompt.tsx:30` — install button: `rounded-lg` -> `rounded-xl`
- `PWAUpdateNotification.tsx:29` — icon box: `rounded-lg` -> `rounded-xl`
- `PWAUpdateNotification.tsx:56` — reload button: `rounded-lg` -> `rounded-xl`
- `PWAUpdateNotification.tsx:62` — close button: `rounded-lg` -> `rounded-xl`

### 2.2 Standardize shadows
Target hierarchy: `shadow-sm` (resting) / `shadow-md` (hover/secondary) / `shadow-xl` (floating UI) / `shadow-2xl` (hero/overlays).

Changes:
- `InstallPrompt.tsx:14` — container: `shadow-2xl` -> `shadow-xl`
- `InstallPrompt.tsx:30` — install button: remove `shadow-lg shadow-blue-500/30`
- `TaskInput.tsx:45` — add button: `shadow-lg` -> `shadow-md`
- `TaskList.tsx:160` — reset button: `shadow-lg` -> `shadow-md`

### 2.3 Standardize letter spacing
Target: all small uppercase labels use `tracking-wide`. Remove `tracking-widest` and `tracking-[0.2em]`.

Changes:
- `TaskCard.tsx:253` — Done button: `tracking-widest` -> `tracking-wide`
- `TaskList.tsx:115` — "Tasks" heading: `tracking-widest` -> `tracking-wide`
- `TaskList.tsx:122` — Load button: `tracking-tighter` -> `tracking-wide`
- `TaskList.tsx:133` — Save button: `tracking-tighter` -> `tracking-wide`
- `TaskList.tsx:144` — Clear button: `tracking-tighter` -> `tracking-wide`
- `RoutineManager.tsx:138` — "Saved Libraries": `tracking-widest` -> `tracking-wide`
- `ArrivalDisplay.tsx:61` — completion label: `tracking-[0.2em]` -> `tracking-wide`
- `ArrivalDisplay.tsx:148` — main label: `tracking-[0.2em]` -> `tracking-wide`
- `ArrivalDisplay.tsx:168` — "min left": `tracking-widest` -> `tracking-wide`

### 2.4 Conductor: Manual Verification — Phase 2
- Visual review of all components. Check border-radius consistency, shadow hierarchy, and typography across:
  - ArrivalDisplay (all 4 states: idle, running, paused, overtime, completed)
  - TaskCard (pending, running, paused, overtime, completed)
  - TaskInput
  - RoutineManager (drawer, save/load/delete modals, empty state)
  - InstallPrompt
  - PWAUpdateNotification

---

## Phase 3: Visual Refinements

### 3.1 Remove jarring scale transitions
No tests assert on scale values. Manual verification only.

Changes:
- `TaskCard.tsx:255` — overtime Done button: remove `scale-110`
- `TaskList.tsx:146` — confirm-clear: remove `scale-105`

### 3.2 Redesign completed task styling (TDD)
**Why TDD:** The change removes `opacity-70` (which affects readability/accessibility) and replaces it with muted colors. This is a behavioral change — "completed tasks must remain readable" — and there's an existing pattern of color tests in `TaskCard.color.test.tsx`.

**Existing test to update:** `TaskCard.test.tsx:80` asserts `opacity-50` for *dragging* — NOT affected by this change.

- **Red:** Add a new `describe('Completed State')` block in `TaskCard.color.test.tsx` that asserts:
  - Completed card does NOT have `opacity-70`
  - Completed card has `bg-gray-50` and `border-gray-200`
  - Completed title has `text-gray-400` and `line-through` (already the case, but formalize)
  - Run tests — Red (card currently has `opacity-70`)

- **Green:** Update `TaskCard.tsx`:
  - `cardClasses.completed`: `'border-green-100 bg-green-50/50 opacity-70'` -> `'border-gray-200 bg-gray-50'`
  - Keep existing `titleClasses.completed`: `'line-through text-gray-400 font-medium'` (already good)
  - Keep existing `labelClasses.completed`: `'text-gray-400'` (already good)
  - Keep existing `timeDisplayClasses.completed`: `'text-gray-400'` (already good)
  - Run tests — Green.

- **Refactor:** Verify completed ETA text (`text-xs font-bold` in gray) passes WCAG AA contrast against `bg-gray-50`. `text-gray-400` (#9ca3af) on `bg-gray-50` (#f9fafb) = contrast ~2.6:1 — fails AA. Adjust to `text-gray-500` (#6b7280) = ~4.6:1 — passes. Update classes and tests accordingly.

### 3.3 Conductor: Manual Verification — Phase 3
- Verify overtime Done button no longer jumps in size.
- Verify "Clear All" -> "Are you sure?" transition is smooth without scale jump.
- Verify completed tasks look clearly "done" but remain readable.
- Spot-check WCAG AA contrast on completed task text.

---

## Final: Run Full Test Suite
- `npm test` — all tests must pass.
- `npm run build` — production build must succeed.
