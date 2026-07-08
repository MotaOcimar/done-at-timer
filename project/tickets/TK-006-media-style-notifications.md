---
id: TK-006
title: Media-style notifications with progress and controls
type: feature
status: open
specs: [SPEC-014]
---

# Media-style notifications with progress and controls

## Context

Notifications today only fire when a task's time is up ([SPEC-014]). Using the
Media Session API (or advanced PWA notifications) the running task could show a
persistent notification with current progress and play/pause controls, like a music
player. Especially valuable on mobile, where the app is often backgrounded.
Migrated from `conductor/backlog.md` (TK-001).

## Acceptance criteria

- [ ] While a task runs, a system-level notification/media surface shows the task
      name and its progress.
- [ ] The surface offers play/pause (and possibly complete/skip) controls that act
      on the running task.
- [ ] Degrades gracefully where the API is unavailable — existing time-up
      notifications keep working unchanged.
- [ ] SPEC-014 is updated with the new behavior.

## Notes

Needs a viability check per platform (Media Session API support differs between
Android/desktop browsers, and iOS PWA support is limited). Per the engineering
rules, the browser API must be wrapped behind an abstraction layer.
