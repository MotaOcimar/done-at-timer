# Specification: Replace Notification Bell with Context-Aware Prompt

## Overview
Remove the persistent `NotificationBell` from the header and introduce a context-aware "Top Banner" prompt that asks for notification permission only when it becomes relevant.

## Functional Requirements
1. **Remove Existing Bell**: Remove the `NotificationBell` component from its absolute position in `App.tsx`.
2. **New Notification Prompt Component**:
   - **Style**: A top-anchored banner (Top Banner).
   - **Content**: "Don't miss a beat! Enable notifications to be alerted when each task ends."
   - **Actions**: "Enable" button and a "Dismiss" (X) button.
3. **Trigger Logic**:
   - The prompt appears when a task status changes to `COMPLETED` for the first time.
   - It only shows if notification permission is currently `'default'` (not yet asked).
   - It only shows if the user hasn't previously dismissed it.
4. **Action Logic**:
   - **Enable**: Triggers `Notification.requestPermission()`. If granted/denied, hide the prompt permanently.
   - **Dismiss**: Hides the prompt and stores a `notifications_prompt_dismissed` flag in LocalStorage to prevent it from reappearing.
5. **Persistence**: Use LocalStorage to track if the prompt has been dismissed.

## Non-Functional Requirements
- **Responsive Design**: The banner must look good on both mobile and desktop.
- **Visual Consistency**: Use existing Tailwind colors and Lucide icons.

## Acceptance Criteria
- [ ] Header no longer contains the `NotificationBell` icon.
- [ ] Completing the first task in a routine triggers the banner (if permission state is `'default'`).
- [ ] Clicking "Enable" results in the browser permission dialog appearing.
- [ ] Clicking "Dismiss" hides the banner and prevents it from showing again on subsequent completions or reloads.
- [ ] If permission is granted or denied via the "Enable" flow, the banner disappears permanently.
