# Specification: Unified Sidebar Menu (Control Center)

## 1. Overview

Consolidate routine management, notification permissions, and PWA installation into a single, unified Sidebar Menu. This declutters the main UI, removes distracting prompts/icons from the header, and aligns with the app's minimalist philosophy.

### 1.1 Design Principle: Focus over Discoverability

Done-At Timer is built for people who struggle with time perception and need to stay focused on completing tasks and routines. Every element on the main screen competes for their attention. Floating banners, icon badges, and permission prompts — even well-intentioned ones — are distractions that pull focus away from the timer, which is the core of the app.

This consolidation intentionally trades discoverability (e.g., fewer PWA installs, less visible notification prompts) for a cleaner, distraction-free main view. Secondary features belong in the sidebar, accessed only when the user chooses to. Future UI decisions should follow this same principle: if it's not the timer or the current task, it shouldn't demand attention on the main screen.

## 2. Functional Requirements

### 2.1 Rename RoutineManager to ControlCenter

Rename/refactor `RoutineManager` component to `ControlCenter` to reflect its expanded role as the app's central Control Center.

- Preserve all existing Routine functionality (save, load, delete, confirmation modals).
- The component interface (`isOpen`, `onClose`, etc.) remains the same.
- Update the sidebar drawer title from "Your Routines" to "Control Center".

### 2.2 Add Preferences Section — Notification Toggle

Add a "Preferences" section to the sidebar with a notification permission toggle using the `useNotification` hook, and an app-level toggle using `useTaskStore`.

**States to handle:**
- `default` — Show an "Enable Notifications" toggle/button. Clicking it calls `requestPermission()`.
- `granted` — Show an active toggle representing the app-level notification state. Users can click it to turn notifications on or off within the app without changing browser permissions.
- `denied` — Show a visual indicator that notifications are blocked (red/muted). Display helper text: "Notifications are blocked. To enable, update your browser's site settings."
- `unsupported` — Hide the notification toggle entirely (browser doesn't support notifications).

### 2.3 Add App Section — Install App

Integrate PWA install functionality (from `InstallPrompt`) into the sidebar using the `useInstallPrompt` hook.

- **States to handle:**
  - `installable` (and not iOS) — Show "Install App" button. Clicking calls `promptInstall()`.
  - `ios` — Show "Share → Add to Home Screen" instructions.
  - `installed` (standalone mode) — Show a "✓ App Installed" indicator.
  - `unavailable` — Show a muted message: "Installation not available in this browser" (if not installable and not already installed).

### 2.4 Header Update

- Replace the current "Library" icon/button in `App.tsx` with the `Menu` icon from `lucide-react`. Add `aria-label="Open menu"` to the button.
- **Minimalist Styling:** The menu button should have a minimalist style: no background, no border, no shadow — only the icon visible on the transparent background.
- Remove the `NotificationBell` component from the header entirely.
- Remove the standalone `InstallPrompt` banner from `App.tsx`.

### 2.5 Preferences Section — Notification Toggle (Refinement)

- **Coherent Icons:** Use the `Bell` icon when notifications are enabled and the `BellOff` icon when notifications are disabled or paused. This ensures visual consistency across states.

### 2.5 Remove Standalone Components

After integrating their functionality into `ControlCenter`:

- Delete `src/components/NotificationBell.tsx` and `src/components/NotificationBell.test.tsx`.
- Delete `src/components/InstallPrompt.tsx` and `src/components/InstallPrompt.test.tsx`.
- The hooks (`useNotification`, `useInstallPrompt`) are preserved — only the standalone UI components are removed.

### 2.6 UI/UX

- Clear visual separation between "Routines", "Preferences", and "App" sections using section headers (styled like the existing "Saved Libraries" heading: `text-xs font-black text-gray-300 uppercase tracking-wide`).
- Consistent styling with existing sidebar (Tailwind CSS, same border-radius/shadow tokens).
- Sidebar drawer title changes from "Your Routines" to "Control Center" (or "Menu").

## 3. Non-Functional Requirements

- **Accessibility:** All interactive elements must have `aria-label` attributes. Toggle states must be conveyed to screen readers.
- **Responsiveness:** The sidebar must work correctly on mobile (full-width drawer) and desktop (max-w-sm).
- **No regressions:** All existing tests must continue to pass. Update test selectors/assertions where component names change.
- **Performance:** No additional re-renders — hooks are only called inside the sidebar component.

## 4. Acceptance Criteria

- [ ] Header has a single menu/settings icon instead of the library + bell icons.
- [ ] `NotificationBell` and `InstallPrompt` standalone components are removed from the main view.
- [ ] Sidebar contains clearly separated sections for Routines, Preferences, and App.
- [ ] Notification toggle correctly reflects current permission state (`default`/`granted`/`denied`).
- [ ] Clicking the notification toggle when permission is `default` triggers the browser permission prompt.
- [ ] When permission is `granted`, an app-level toggle allows turning notifications on/off.
- [ ] Notifications are only sent if both browser permission is `granted` and app-level toggle is enabled.
- [ ] When permission is `denied`, helper text explains how to unblock via browser settings.
- [ ] When permission is `unsupported`, the notification section is hidden.
- [ ] "Install App" button appears only when the app is installable.
- [ ] On iOS, the sidebar shows "Share → Add to Home Screen" instructions instead of an install button.
- [ ] When the app is already installed, the sidebar shows an "App Installed" indicator.
- [ ] When installation is not possible, the sidebar explains it is "Unavailable in this browser".
- [ ] All existing RoutineManager tests pass (updated for rename).
- [ ] New tests cover notification toggle states and all app installation states (including "Installed" and "Unavailable").

## 5. Out of Scope

- Dark mode.
- New notification features (scheduling, custom sounds, etc.).
- Changes to notification delivery logic (`NotificationManager`, `useNotification` internals).
- Changes to PWA service worker or manifest configuration.
- Redesign of the routine save/load/delete modals.
- Changes to the `useInstallPrompt` hook internals.
