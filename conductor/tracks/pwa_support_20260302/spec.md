# Specification: PWA Support

## 1. Overview
Transform the Done-At Timer into an installable Progressive Web App. The app already stores all data in localStorage (via Zustand persist) and has no backend — making it an ideal PWA candidate. The focus is on **installability**, **offline asset caching**, and **local timer notifications**.

## 2. Functional Requirements

### Web App Manifest
- Name: "Done-At Timer", short name: "Done-At"
- `display: standalone`, orientation: `any`
- Theme color and background color matching the app's existing palette
- Start URL: `/done-at-timer/` (GitHub Pages base path)
- PWA icons in required sizes (192×192, 512×512) — generated programmatically or as simple SVG/PNG placeholders

### Offline Support (Service Worker via vite-plugin-pwa)
- Use `vite-plugin-pwa` with Workbox for automatic service worker generation
- **Precache** all build assets (HTML, JS, CSS, fonts, icons)
- Strategy: `generateSW` mode (no custom service worker logic needed)
- The app is already fully functional offline for data (localStorage) — only asset caching is needed

### Installability
- Meet Chromium PWA install criteria (manifest + service worker + HTTPS)
- Optional: "Install App" prompt/button in the UI to surface the `beforeinstallprompt` event
- iOS: Add `apple-touch-icon` and `apple-mobile-web-app-capable` meta tags

### Local Notifications (Timer Completion)
- Use the **Notification API** (not Push API — no server needed) to alert the user when a task's timer completes
- Request notification permission via a UI affordance (not on page load)
- Graceful degradation: if permission is denied or unsupported, the app works normally without notifications

## 3. Non-Functional Requirements
- **Base path awareness**: All PWA assets (manifest, icons, service worker scope) must work under `/done-at-timer/`
- **Build integration**: Service worker is generated as part of `npm run build` via vite-plugin-pwa
- **No impact on dev**: Service worker is disabled in development mode by default
- **Lighthouse PWA score**: Must pass all "Installable" checks

## 4. Acceptance Criteria
- [ ] App can be installed on Android (Chrome), iOS (Safari), and Desktop (Chrome/Edge)
- [ ] App loads and is fully functional when offline (after first visit)
- [ ] `npm run build` generates a valid service worker and manifest
- [ ] Lighthouse PWA audit passes all "Installable" criteria
- [ ] Icons display correctly on home screen and splash screen
- [ ] Local notification fires when a task timer completes (if permission granted)

## 5. Out of Scope
- Push notifications (server-side) — no backend exists
- Custom icon design — simple placeholders are fine
- App Store / Play Store submission
- Background sync or periodic sync
