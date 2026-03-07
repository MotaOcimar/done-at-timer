# Implementation Plan: Polish & Consistency Refinement

## Phase 1: Cleanup and Bug Fixes
- [ ] Task: Delete `src/App.css` (no imports exist — just delete the file and verify build).
- [ ] Task: TDD — Fix sticky header z-index (`App.tsx:25`): change `z-50` to `z-30`. Update `integration.sticky.test.tsx` assertion accordingly.
- [ ] Task: TDD — Add global CSS rule in `index.css` to hide spin buttons on `input[type="number"]`. Only `TaskInput.tsx:33` is affected (InlineEdit already uses `type="text"`).
- [ ] Task: Conductor — User Manual Verification 'Phase 1: Cleanup and Bug Fixes'

## Phase 2: Design Token Standardization
- [ ] Task: TDD — Standardize border radius across all components:
    - `ArrivalDisplay.tsx`: `rounded-3xl` -> `rounded-2xl` (main container + completion state)
    - `RoutineManager.tsx`: `rounded-3xl` -> `rounded-2xl` (save/load/delete modals, empty state)
    - `InstallPrompt.tsx`: `rounded-lg` -> `rounded-xl` (icon box, install button)
    - `PWAUpdateNotification.tsx`: `rounded-lg` -> `rounded-xl` (icon box, reload button, close button)
- [ ] Task: TDD — Standardize shadows:
    - `InstallPrompt.tsx`: `shadow-2xl` -> `shadow-xl`, remove button `shadow-lg shadow-blue-500/30`
    - `TaskInput.tsx`: add button `shadow-lg` -> `shadow-md`
    - `TaskList.tsx`: reset button `shadow-lg` -> `shadow-md`
- [ ] Task: TDD — Standardize letter spacing:
    - `TaskCard.tsx:253`: `tracking-widest` -> `tracking-wide`
    - `TaskList.tsx:115,122,133,144`: `tracking-widest`/`tracking-tighter` -> `tracking-wide`
    - `RoutineManager.tsx:138`: `tracking-widest` -> `tracking-wide`
    - `ArrivalDisplay.tsx:61,148`: `tracking-[0.2em]` -> `tracking-wide`
    - `ArrivalDisplay.tsx:168`: `tracking-widest` -> `tracking-wide`
- [ ] Task: Conductor — User Manual Verification 'Phase 2: Design Token Standardization'

## Phase 3: Visual Refinements
- [ ] Task: TDD — Remove jarring scale transitions:
    - `TaskCard.tsx:255`: remove `scale-110` from overtime "Done" button
    - `TaskList.tsx:146`: remove `scale-105` from confirm-clear state
- [ ] Task: TDD — Redesign completed task styling:
    - `TaskCard.tsx:151`: replace `opacity-70` with explicit muted colors (`border-gray-200 bg-gray-50`)
    - Update `titleClasses.completed`, `labelClasses.completed`, `timeDisplayClasses.completed` to use consistent gray tones
    - Verify WCAG AA contrast compliance
    - Update `TaskCard.test.tsx` assertions if they check for `opacity-50`/`opacity-70` classes
- [ ] Task: Conductor — User Manual Verification 'Phase 3: Visual Refinements'
