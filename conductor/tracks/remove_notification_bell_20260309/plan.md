# Implementation Plan: Unified Sidebar Menu (Control Center)

## Phase 1: Cleanup and Refactoring
- [ ] Task: Remove `NotificationBell` and `InstallPrompt` calls from `App.tsx`.
- [ ] Task: Rename `src/components/RoutineManager.tsx` to `src/components/SidebarMenu.tsx`.
- [ ] Task: Remove `src/components/NotificationBell.tsx`, `src/components/NotificationBell.test.tsx`, `src/components/InstallPrompt.tsx`, and `src/components/InstallPrompt.test.tsx`.

## Phase 2: Sidebar Enhancement
- [ ] Task: Update `SidebarMenu.tsx` (formerly `RoutineManager`) to include a "Settings" or "Preferences" section.
- [ ] Task: Implement a Notification Toggle within the sidebar using the `useNotification` hook.
- [ ] Task: Implement an "Install App" section within the sidebar using the `useInstallPrompt` hook.
- [ ] Task: Ensure the sidebar layout handles multiple sections elegantly (using separators/headers).

## Phase 3: Header and Integration
- [ ] Task: Update the header button in `App.tsx` to use a `Settings` or `Menu` icon from Lucide.
- [ ] Task: Update all references to `RoutineManager` to `SidebarMenu` across the codebase.
- [ ] Task: Verify that the sidebar correctly reflects the current notification permission state and installability.

## Phase 4: Verification and Polish
- [ ] Task: Update/Add tests for the new `SidebarMenu` component.
- [ ] Task: Verify the mobile experience for the new unified menu.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
