# Implementation Plan: PWA Installation Status Detection (PC/Brave)

## Phase 0: Lint Fixes from Sidebar Menu Review [checkpoint: 73b041a]

### [x] 0.1 Fix `useInstallPrompt.ts` — setState síncrono no effect c57fafb
- Move `isStandalone` initialization from `useEffect` body to `useState` initializer to avoid cascading renders.
- Remove the unused/duplicated `eslint-disable-next-line` directive on line 26.
- Run `npm run lint` — errors on `useInstallPrompt.ts` resolved.

### [x] 0.2 Fix `useTaskStore.ts` — `let` → `const` c57fafb
- Change `let tasks` to `const tasks` on line 76 to satisfy `prefer-const` rule.
- Run `npm run lint` — error on `useTaskStore.ts` resolved.

---

## Phase 1: PWA Manifest Update

### [x] 1.1 Add `related_applications` to PWA Manifest 549fd40
- Update `pwa-manifest.ts` to include `related_applications` with `platform: "webapp"` and the app's `url` (e.g., the GitHub Pages URL).
- This is required for `navigator.getInstalledRelatedApps()` to work.
- No TDD needed — purely declarative configuration change.

## Phase 2: Hook Improvement (TDD)

### Design Decision: `isAlreadyInstalled` vs `isStandalone`
- `isStandalone` detects display-mode — only true when the app is **opened as a PWA**.
- `isAlreadyInstalled` uses `navigator.getInstalledRelatedApps()` — detects installation even from a **regular browser tab**.
- Both are kept. The UI shows "App Installed" when **either** is true.
- On `appinstalled` event, both `isStandalone` and `isAlreadyInstalled` should be set to `true`.

### [ ] 2.1 Update `useInstallPrompt.ts` (TDD)
- **Red:** Add a `describe('getInstalledRelatedApps detection')` block in `useInstallPrompt.test.ts` with tests for:
  1. `isAlreadyInstalled` initializes as `false` (default values test already covers this — extend it).
  2. API available + returns non-empty array → `isAlreadyInstalled` is `true`.
  3. API available + returns empty array → `isAlreadyInstalled` remains `false`.
  4. API not available (e.g., Firefox/Safari — `navigator.getInstalledRelatedApps` is `undefined`) → `isAlreadyInstalled` remains `false`, no error thrown.
  5. `appinstalled` event fires → `isAlreadyInstalled` becomes `true` (extend existing appinstalled test).
  6. `isStandalone=true` + API returns match → both `isStandalone` and `isAlreadyInstalled` are `true` (no conflict).
  - **Important:** The API is async (`Promise`). Tests must use `waitFor` or `act(async ...)` to handle the resolved promise before asserting.
  - Run tests — all new tests fail.
- **Green:** In `useInstallPrompt.ts`:
  - Add `const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false)`.
  - In `useEffect`, check if `navigator.getInstalledRelatedApps` exists. If so, call it and set `isAlreadyInstalled` based on result length.
  - In `handleAppInstalled`, also call `setIsAlreadyInstalled(true)`.
  - Add `isAlreadyInstalled` to the return value.
- **Refactor:** Evaluate whether `isStandalone` can be derived from `isAlreadyInstalled` in some cases to reduce redundancy. Keep both if they serve distinct purposes (standalone = display mode, alreadyInstalled = API detection).

## Phase 3: UI Update (TDD)

### [ ] 3.1 Update `ControlCenter.tsx` (TDD)
- **Red:** Add/update tests in `ControlCenter.test.tsx` under the App installation `describe` block:
  1. `isAlreadyInstalled=true`, `isStandalone=false` → shows "App Installed" indicator (the core fix).
  2. `isAlreadyInstalled=true`, `isInstallable=true` → shows "App Installed", **not** the "Install App" button (`isAlreadyInstalled` takes priority).
  3. `isAlreadyInstalled=false`, `isInstallable=true`, `isStandalone=false` → shows "Install App" button (regression guard).
  4. `isAlreadyInstalled=false`, `isStandalone=false`, `isInstallable=false` → shows "Installation not available" (regression guard).
  5. `isAlreadyInstalled=false`, `isStandalone=true` → shows "App Installed" (existing behavior preserved).
  - Run tests — new tests fail.
- **Green:** Update the condition chain in `ControlCenter.tsx`:
  - Change `{isStandalone ? (` to `{(isStandalone || isAlreadyInstalled) ? (` (or equivalent).
  - Update the `useInstallPrompt()` destructure to include `isAlreadyInstalled`.
- **Refactor:** Verify the condition chain reads clearly and the priority order is obvious: installed → installable → unavailable.

---

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
