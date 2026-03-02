# Implementation Plan: PWA Support

> **Methodology**: Strict TDD (Red → Green → Refactor) and SOLID principles throughout.
> Every task starts by writing a failing test, then the minimal implementation to pass it, then refactoring.

## Phase 1: Manifest, Icons & vite-plugin-pwa Setup

- [x] Task: Install `vite-plugin-pwa` as a dev dependency [ee807e4]
- [ ] Task: Create PWA icon assets (192×192 and 512×512 PNG placeholders) in `public/`
- [ ] Task: Validate icon assets — must be exact dimensions (192×192, 512×512), square aspect ratio (1:1), PNG format with transparency support, and `purpose: "any maskable"` in manifest (Chromium is strict about these for install prompt)
- [ ] Task: **RED** — Write tests asserting that `npm run build` output contains `manifest.webmanifest` with correct `name`, `short_name`, `display`, `start_url`, `icons`
- [ ] Task: **GREEN** — Configure `VitePWA()` plugin in `vite.config.ts` with manifest metadata, icon paths, and `registerType: 'autoUpdate'`
- [ ] Task: **REFACTOR** — Extract manifest config into a dedicated object/file if config becomes large (Single Responsibility)
- [ ] Task: **RED** — Write tests asserting `index.html` contains `apple-touch-icon` and `apple-mobile-web-app-capable` meta tags
- [ ] Task: **GREEN** — Add iOS meta tags to `index.html`
- [ ] Task: Verify `npm run build` generates `manifest.webmanifest` and `sw.js` in `dist/`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Manifest & Setup' (Protocol in workflow.md)

## Phase 2: Offline Support & Install Prompt

- [ ] Task: **RED** — Write integration test: after service worker registration, app shell loads when network is unavailable
- [ ] Task: **GREEN** — Verify precaching config in vite-plugin-pwa covers all critical assets
- [ ] Task: **RED** — Write tests for `InstallPrompt` component: captures `beforeinstallprompt`, shows install button only when event is available, hides after install, does not render when already installed
- [ ] Task: **GREEN** — Create `InstallPrompt` component implementing the `beforeinstallprompt` event logic (Dependency Inversion: accept event interface, not browser global directly)
- [ ] Task: **REFACTOR** — Ensure `InstallPrompt` follows Single Responsibility (UI only) and extract install logic into a `useInstallPrompt` hook (Interface Segregation)
- [ ] Task: **RED** — Write test: `InstallPrompt` is not visible on iOS (where `beforeinstallprompt` doesn't fire)
- [ ] Task: **GREEN** — Handle iOS gracefully (show Safari-specific instructions or hide prompt)
- [ ] Task: Add `InstallPrompt` to the app layout in an unobtrusive position
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Offline & Install' (Protocol in workflow.md)

## Phase 3: Local Notifications on Timer Completion

- [ ] Task: **RED** — Write tests for a `NotificationService` (or adapter): `requestPermission()` returns permission state, `notify(title, options)` creates a notification, handles denied/unsupported gracefully
- [ ] Task: **GREEN** — Implement `NotificationService` as a thin wrapper around the Notification API (Dependency Inversion: depend on an abstraction so tests can mock the browser API)
- [ ] Task: **REFACTOR** — Ensure the service follows Open/Closed principle — extendable for future notification types without modifying existing code
- [ ] Task: **RED** — Write tests for a `useNotification` hook: exposes `permission` state, `requestPermission()`, and `notifyTaskComplete(taskTitle)`
- [ ] Task: **GREEN** — Implement `useNotification` hook consuming `NotificationService`
- [ ] Task: **RED** — Write tests: when a task completes and permission is granted, a notification fires with the task title; when denied, no notification and no error
- [ ] Task: **GREEN** — Integrate notification trigger in the task completion flow (in the store's `completeTask` action or `useTimer` hook)
- [ ] Task: **RED** — Write tests for a UI element (bell icon/toggle) that requests notification permission on click
- [ ] Task: **GREEN** — Implement the permission request UI element
- [ ] Task: **REFACTOR** — Review all notification code for Single Responsibility and clean interfaces
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Notifications' (Protocol in workflow.md)

## Phase 4: Quality & Cross-Platform Verification

- [ ] Task: Run full test suite — all tests must pass (no skipped tests)
- [ ] Task: Run Lighthouse PWA audit and fix any flagged issues
- [ ] Task: Test installation on Android Chrome, iOS Safari, and Desktop Chrome/Edge
- [ ] Task: **RED** — Write test asserting service worker update flow works (new version detected → user notified)
- [ ] Task: **GREEN** — Implement update notification if not handled by `registerType: 'autoUpdate'`
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Quality Gates' (Protocol in workflow.md)
