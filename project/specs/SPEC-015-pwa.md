---
id: SPEC-015
title: PWA (install, offline, updates)
status: implemented
links: [SPEC-001, SPEC-012]
---

# PWA

- The app is **installable** as a native-like app on Android, iOS and desktop.
- After the first visit it is **fully functional offline** ([SPEC-001]).
- Install experience, from the Control Center ([SPEC-012]):
  - platforms with a native install prompt get an "Install App" action;
  - iOS gets step-by-step instructions ("Add to Home Screen"), since it has no
    prompt;
  - once installed, the section shows an installed state instead — detected even
    when the site is opened in a regular browser tab (Chromium browsers), not only
    when running as the installed app;
  - browsers where installation is not possible get a muted explanatory note
    instead of a broken button.
- **Updates:** when a new version is deployed, the running app detects it and shows
  a non-blocking prompt letting the user refresh into the new version.

## Implementation pointers
- `vite.config.ts` / `pwa-manifest.ts`, `src/components/PWAUpdateNotification.tsx`,
  `src/hooks/useInstallPrompt.ts`

## Log
- Seeded from code + conductor archive (2026-07-02)
- TK-004: added in-tab installed detection (pwa_pc_detection track) and the
  installation-unavailable state (2026-07-02)
