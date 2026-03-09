# Implementation Plan: Replace Notification Bell with Context-Aware Prompt

## Phase 1: Removal and Cleanup
- [ ] Task: Remove `NotificationBell` component call from `App.tsx`.
- [ ] Task: Delete `src/components/NotificationBell.tsx` and its test file `src/components/NotificationBell.test.tsx`.
- [ ] Task: Remove any unused imports related to `NotificationBell`.

## Phase 2: Create Notification Prompt Component
- [ ] Task: Create `src/components/NotificationPrompt.tsx` with Top Banner styling.
- [ ] Task: Implement "Enable" and "Dismiss" buttons.
- [ ] Task: Integrate with `useNotification` hook for `requestPermission`.
- [ ] Task: Add basic unit tests for `NotificationPrompt` (rendering, button clicks).

## Phase 3: Logic and Integration
- [ ] Task: Update `App.tsx` or a new hook to track the `notifications_prompt_dismissed` state in LocalStorage.
- [ ] Task: Implement the trigger logic: show prompt if (any task is `COMPLETED`) AND (permission is `'default'`) AND (not dismissed).
- [ ] Task: Insert `NotificationPrompt` into the application layout (e.g., as a fixed banner at the top).
- [ ] Task: Verify that granting/denying permission or dismissing the prompt hides it permanently.

## Phase 4: Verification and Polish
- [ ] Task: Integration test for the end-to-end flow (Complete a task -> Prompt appears -> Dismiss -> Prompt gone).
- [ ] Task: Manual verification on mobile and desktop.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
