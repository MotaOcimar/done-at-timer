# Implementation Plan: Polish & Consistency Refinement

## Methodology Note: TDD vs. Manual Verification

TDD applies to **behavioral** changes where a test can verify intent (z-index layering, completed-task readability). Pure **visual** CSS token swaps (border-radius, shadows, letter-spacing, scale) cannot be meaningfully validated by JSDOM — writing `expect(el).toHaveClass('rounded-2xl')` is brittle, tests implementation not behavior, and adds no safety. These are verified manually.

---

## Phase 1: Cleanup and Bug Fixes [checkpoint: aae408f]

### [x] 1.1 Delete `src/App.css` (851fb2a)
- Delete the file. No imports exist anywhere — verified via grep.
- Run `npm run build` to confirm no breakage.

### [x] 1.2 Fix sticky header z-index (TDD) (bfcb2f2)
**Existing test:** `integration.sticky.test.tsx:21` asserts `z-50`.

- **Red:** Update test assertion from `z-50` to `z-30`. Run test — fails.
- **Green:** In `App.tsx:25`, change `z-50` to `z-30`. Run test — passes.
- **Refactor:** None needed.

### [x] 1.3 Hide spin buttons on number inputs (67c98de)
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

### [x] 2.1 Standardize border radius (586dfd5)
Target system — 3-tier:
- **Small (`rounded-xl`):** Buttons (Add, Done, Restart, Install, Reload), inputs, icon boxes.
- **Medium (`rounded-2xl`):** `TaskCard`s and drag overlays.
- **Large (`rounded-3xl`):** `ArrivalDisplay`, modals, and large prompts/toasts (`InstallPrompt`, `PWAUpdateNotification`).

Changes applied:
- `TaskCard.tsx`: `rounded-2xl` (main container), `rounded-xl` (Done button).
- `TaskInput.tsx`: `rounded-xl` (inputs and Add button).
- `TaskList.tsx`: `rounded-xl` (Restart Routine button).
- `ArrivalDisplay.tsx`: `rounded-3xl` (all containers).
- `RoutineManager.tsx`: `rounded-3xl` (modals/empty state), `rounded-xl` (icon boxes).
- `InstallPrompt.tsx`: `rounded-3xl` (container), `rounded-xl` (icon box/Install button).
- `PWAUpdateNotification.tsx`: `rounded-3xl` (container), `rounded-xl` (icon box/Reload/Close).

### [x] 2.2 Standardize shadows (06bf3a3)
Target hierarchy: `shadow-sm` (resting) / `shadow-md` (hover/secondary) / `shadow-xl` (floating UI) / `shadow-2xl` (hero/overlays).

Changes:
- `InstallPrompt.tsx:14` — container: `shadow-2xl` -> `shadow-xl`
- `InstallPrompt.tsx:30` — install button: remove `shadow-lg shadow-blue-500/30`
- `TaskInput.tsx:45` — add button: `shadow-lg` -> `shadow-md`
- `TaskList.tsx:160` — reset button: `shadow-lg` -> `shadow-md`

### [x] 2.3 Standardize letter spacing (e3a7f03)
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

### [x] 3.1 Remove jarring scale transitions (7cc0571)
No tests assert on scale values. Manual verification only.

Changes:
- `TaskCard.tsx:255` — overtime Done button: remove `scale-110`
- `TaskList.tsx:146` — confirm-clear: remove `scale-105`

### [x] 3.2 Redesign completed task styling (TDD) (c39199d, refined to Soft Green)
**Why TDD:** The change removes `opacity-70` (which affects readability/accessibility) and replaces it with muted colors. This is a behavioral change — "completed tasks must remain readable" — and there's an existing pattern of color tests in `TaskCard.color.test.tsx`.

- **Refined Design (Soft Green):** Uses `bg-green-50` and `border-green-200` for a positive "mission accomplished" feel without global opacity reduction. Text uses transparent green shades (`text-green-800/50` for title, etc.).

### 3.3 Conductor: Manual Verification — Phase 3
- Verify overtime Done button no longer jumps in size.
- Verify "Clear All" -> "Are you sure?" transition is smooth without scale jump.
- Verify completed tasks look clearly "done" but remain readable.
- Spot-check WCAG AA contrast on completed task text.

---

## Final: Run Full Test Suite
- `npm test` — all tests must pass.
- `npm run build` — production build must succeed.
