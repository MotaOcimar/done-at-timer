# Specification: Unified Sidebar Menu (Control Center)

## Overview
Consolidate routine management, notification permissions, and PWA installation into a single, unified Sidebar Menu. This declutters the main UI, removes distracting prompts, and aligns with the app's minimalist philosophy.

## Functional Requirements
1.  **Header Update**:
    - Replace the "Library" icon/button with a "Settings" or "Menu" icon (e.g., `Settings` or `Menu` from Lucide).
    - Remove the `NotificationBell` icon completely from the header.
2.  **Unified Sidebar (`SidebarMenu`)**:
    - Rename/Refactor `RoutineManager` to `SidebarMenu`.
    - **Routine Section**: Preserve existing "Save Routine" and "Load Routine" functionality.
    - **Preferences Section**: Add a toggle or button to manage Notification permissions using the `useNotification` hook.
    - **App Section**: Integrate the "Install App" functionality (from `InstallPrompt`) into the sidebar. Only show this if the app is installable and not already installed.
3.  **Remove Automatic Prompts**:
    - Remove the automatic `InstallPrompt` banner.
    - Remove the permanent `NotificationBell`.
    - Notification permission should be managed via the sidebar toggle.
4.  **UI/UX**:
    - Clear visual separation between "Routines", "Preferences", and "App" sections.
    - Use consistent styling (Tailwind CSS).

## Acceptance Criteria
- [ ] Header has a single menu/settings icon instead of the library icon.
- [ ] `NotificationBell` and `InstallPrompt` banners are removed from the main view.
- [ ] Sidebar contains sections for Routines, Notifications, and Installation.
- [ ] Notifications can be toggled from the sidebar.
- [ ] "Install App" button appears in the sidebar only when the app is installable.
