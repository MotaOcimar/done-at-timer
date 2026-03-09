# Implementation Plan: Unified Sidebar Menu (Control Center)

## Phase 1: Build the Unified Sidebar

### [x] 1.1 Rename RoutineManager to ControlCenter (48b0e6a)
- Rename `src/components/RoutineManager.tsx` → `src/components/ControlCenter.tsx` and update the export name.
- Rename `src/components/RoutineManager.test.tsx` → `src/components/ControlCenter.test.tsx` and update all references.
- Update the import in `App.tsx` from `RoutineManager` to `ControlCenter`.
- Update the sidebar drawer title from "Your Routines" to "Control Center".
- Run `npm test` — all existing tests pass with updated names. No TDD needed (pure rename, no new behavior).

### [x] 1.2 Add Notification Toggle to ControlCenter (TDD) (315f4c4)
- **Red:** In `ControlCenter.test.tsx`, add tests for:
  - Renders "Enable Notifications" toggle when permission is `default`.
  - Calls `requestPermission()` when the toggle is clicked.
  - Shows "enabled" indicator when permission is `granted`.
  - Shows "blocked" message with helper text when permission is `denied`.
  - Hides notification section entirely when permission is `unsupported`.
  - Run tests — all new tests fail.
- **Green:** In `ControlCenter.tsx`, add a "Preferences" section below the routines list. Use the `useNotification` hook to read permission state and trigger `requestPermission`. Implement the four visual states.
- **Refactor:** Extract section header styling if duplicated.

### [ ] 1.3 Add Install App section to ControlCenter (TDD)
- **Red:** In `ControlCenter.test.tsx`, add tests for:
  - Shows "Install App" button when `isInstallable` is `true` and not iOS.
  - Shows iOS share instructions when `isIOS` is `true`.
  - Calls `promptInstall()` when install button is clicked.
  - Hides install section when `isInstallable` is `false`.
  - Run tests — all new tests fail.
- **Green:** In `ControlCenter.tsx`, add an "App" section below Preferences. Use the `useInstallPrompt` hook. Implement conditional rendering based on `isInstallable` and `isIOS`.
- **Refactor:** Ensure consistent section styling across Routines, Preferences, and App.

### 1.4 Conductor: Manual Verification — Phase 1
- Open the sidebar and verify all three sections are visible (Routines, Preferences, App).
- Test notification toggle: click to request permission, verify state updates.
- Test install section visibility (if in an installable context).
- Verify existing routine save/load/delete still works correctly.

---

## Phase 2: Header Update and Cleanup

### [ ] 2.1 Update header icon in App.tsx
- Replace the "Library" icon button in `App.tsx` with the `Menu` icon from Lucide (`lucide-react`).
- Add `aria-label="Open menu"` to the button.
- No TDD needed — pure visual icon swap with no behavioral change (same `onClick` handler).

### [ ] 2.2 Remove NotificationBell from App.tsx
- Remove the `<NotificationBell />` component and its import from `App.tsx`.
- Clean up the `absolute top-4 right-4` wrapper div that contained the bell.
- Run `npm test` — all tests pass (no assertion-of-absence needed).

### [ ] 2.3 Remove InstallPrompt from App.tsx
- Remove the `<InstallPrompt />` component and its import from `App.tsx`.
- Run `npm test` — all tests pass.

### [ ] 2.4 Delete standalone component files
- Run `npm run build` first to confirm no remaining imports reference these components.
- Delete `src/components/NotificationBell.tsx` and `src/components/NotificationBell.test.tsx`.
- Delete `src/components/InstallPrompt.tsx` and `src/components/InstallPrompt.test.tsx`.
- Run `npm run build` again to confirm clean build.

### 2.5 Conductor: Manual Verification — Phase 2
- Verify the header shows a single menu/settings icon (no bell icon).
- Verify no floating `InstallPrompt` banner appears at the bottom of the screen.
- Verify opening the sidebar still shows notification and install controls.
- Verify all pages/routes still render without import errors.

---

## Phase 3: Verification and Polish

### [ ] 3.1 Update all codebase references
- Search for any remaining references to `RoutineManager`, `NotificationBell`, or `InstallPrompt` across the codebase (imports, comments, test files).
- Update or remove as needed.

### [ ] 3.2 Verify mobile experience
- Test the sidebar on mobile viewport (Chrome DevTools or real device).
- Verify touch targets are adequate (44x44px minimum).
- Verify notification toggle and install button are easily tappable.

### 3.3 Conductor: Manual Verification — Phase 3
- Full walkthrough on mobile viewport:
  1. Start dev server: `npm run dev`
  2. Open browser to `http://localhost:5173/done-at-timer/`
  3. Tap the menu icon — sidebar opens.
  4. Verify "Routines" section: save, load, delete a routine.
  5. Verify "Preferences" section: notification toggle reflects browser permission state.
  6. Verify "App" section: install button visible (if installable) or section hidden.
  7. Close sidebar — main view is clean, no bell or install banner visible.

---

## Final: Run Full Test Suite
- `CI=true npm test` — all tests must pass.
- `npm run build` — production build must succeed.
- `npm run lint` — no lint errors.
