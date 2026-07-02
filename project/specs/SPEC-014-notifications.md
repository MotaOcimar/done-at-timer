---
id: SPEC-014
title: Time-up notifications
status: implemented
links: [SPEC-004, SPEC-012]
---

# Time-up notifications

- When a running task's time runs out, the app fires a **system notification**
  ("Task Complete!", naming the task), so the user is reached even with the app in
  the background. On devices that support it, the notification vibrates and stays
  visible until the user interacts with it.
- Exactly **one notification per time-up event** — it is not repeated during
  overtime.
- A notification fires only when **both** gates are open:
  1. the operating system / browser permission is granted;
  2. the in-app notification toggle is on (persisted, on by default).
- Permission is never requested unprompted: the user asks for it via the Control
  Center ([SPEC-012]), which reflects the current situation — not yet asked (offers
  to enable), granted (shows the toggle), blocked (explains it must be unblocked in
  browser settings), or unsupported (section hidden).

## Implementation pointers
- `src/components/NotificationManager.tsx`, `src/hooks/useNotification.ts`,
  `src/utils/notificationService.ts` (browser-API abstraction, see workflow's
  engineering rules)

## Log
- Seeded from code + conductor archive (2026-07-02)
