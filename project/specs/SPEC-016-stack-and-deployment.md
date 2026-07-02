---
id: SPEC-016
title: Tech stack & deployment
status: implemented
links: [SPEC-001]
---

# Tech stack & deployment

This spec is intentionally about implementation — it records the agreed technical
choices so tickets don't relitigate them.

- **App:** React 19 + TypeScript 5, built with Vite 7.
- **State:** a single Zustand store, persisted to localStorage. All application
  state lives there; component-local state is for ephemeral UI only.
- **Styling:** Tailwind CSS 4, utility-first, no CSS modules.
- **Interaction libs:** dnd-kit (reordering), Framer Motion (swipe/gestures),
  lucide-react (icons), canvas-confetti (celebration).
- **Tests:** Vitest + React Testing Library (jsdom), colocated next to the source
  files. TDD is mandatory (see `project/workflow.md`).
- **Deployment:** static build to GitHub Pages under the base path
  `/done-at-timer/`, automated by GitHub Actions on pushes to `main`
  (`npm run deploy` exists as a manual fallback).
- **Constraint reminder:** static hosting only, no backend ([SPEC-001]).

## Log
- Seeded from code + conductor archive (2026-07-02)
