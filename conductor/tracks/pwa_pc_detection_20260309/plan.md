# Implementation Plan: PWA Installation Status Detection (PC/Brave)

## Phase 1: PWA Manifest Update

### [ ] 1.1 Add `related_applications` to PWA Manifest
- Update `pwa-manifest.ts` to include `related_applications` with `platform: "webapp"` and the app's `url` (e.g., the GitHub Pages URL).
- This is required for `navigator.getInstalledRelatedApps()` to work.
- No TDD needed — purely declarative configuration change.

## Phase 2: Hook Improvement (TDD)

### [ ] 2.1 Update `useInstallPrompt.ts` (TDD)
- **Red:** Add tests to `useInstallPrompt.test.ts` for:
  - Initial check using `navigator.getInstalledRelatedApps()`.
  - Setting `isAlreadyInstalled` to `true` when the API returns matches.
  - Ensuring it handles environments where the API is missing (e.g., non-Chromium).
  - Run tests — new tests fail.
- **Green:** Implement the `isAlreadyInstalled` check in the `useEffect` block of `useInstallPrompt.ts`. Update the return value.
- **Refactor:** Clean up any redundant state if possible.

## Phase 3: UI Update (TDD)

### [ ] 3.1 Update `ControlCenter.tsx` (TDD)
- **Red:** Update `ControlCenter.test.tsx` to:
  - Assert that "App Installed" is shown when `isAlreadyInstalled` is `true`, regardless of `isStandalone` mode.
  - Assert that the "Install App" button is hidden in this case.
  - Run tests — tests fail.
- **Green:** Update the rendering logic in `ControlCenter.tsx` to prioritize `isAlreadyInstalled`.
- **Refactor:** Ensure the messaging is consistent and clearly states that the app is installed.

## Phase 4: Verification and Polish

### [ ] 4.1 Conductor: User Manual Verification 'PWA Detection Fix'
- Follow the Verification and Checkpointing Protocol from `workflow.md`.
- Automated test command: `CI=true npm test`.
- Manual Verification Steps:
  1. Open the app in a **regular browser tab** (Chromium/Brave).
  2. If the app is already installed, open the Control Center and verify it shows "✓ App Installed" (not "Installation not available").
  3. If it's not installed, install it and verify the status updates immediately.

### [ ] 4.2 Final Cleanup & Checkpoint
- Commit all changes and create a checkpoint.
