---
id: TK-014
title: Automated screenshot generation for visual documentation
type: chore
status: open
specs: []
---

# Automated screenshot generation for visual documentation

## Context

The README has no up-to-date visuals, and manual screenshots rot as the UI evolves.
A script (Playwright or Puppeteer) can render the app in key states (active,
paused, completed, reordering) and regenerate the images on demand, feeding a
revitalized `README.md` / `FEATURES.md`. Migrated from `conductor/backlog.md`
(TK-001).

## Acceptance criteria

- [ ] A repeatable script produces screenshots of the app in its main states.
- [ ] `README.md` (and/or a `FEATURES.md`) embeds the generated assets.
- [ ] Regenerating after a UI change requires one command, no manual editing.
