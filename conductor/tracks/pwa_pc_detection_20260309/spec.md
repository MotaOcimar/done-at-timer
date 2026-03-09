# Specification: Fix PWA Installation Status Detection (PC/Brave)

## Overview
Currently, on PC (specifically Brave/Chromium), when the app is already installed but opened in a regular browser tab, the Control Center incorrectly displays "Installation not available" instead of indicating that the app is already installed.

## Functional Requirements
- **Detection Improvement:** Implement a more reliable way to detect if the PWA is already installed on the user's system, even when accessed from a browser tab.
- **Accurate Feedback:** Replace the "Installation not available" message with a "✓ App Installed" status when installation is detected.
- **Support for Chromium:** Ensure this works on Brave and other Chromium-based browsers on PC.

## Technical Details
- **`navigator.getInstalledRelatedApps()`:** Explore using this API to check if the app is already installed.
- **Manifest Update:** If necessary, update the PWA manifest to include `related_applications` for self-referencing.
- **State Management:** Update `useInstallPrompt` hook to include an `isAlreadyInstalled` state.

## Acceptance Criteria
- [ ] On PC (Brave/Chrome), if the app is installed, the Control Center shows "✓ App Installed".
- [ ] If the app is NOT installed, it shows "Install App" (if installable) or appropriate instructions.
- [ ] Transition from "Install App" to "✓ App Installed" happens immediately after a successful installation.

## Out of Scope
- Support for Safari/Firefox (PC) as they don't support standard PWA installation detection/prompts in the same way.
