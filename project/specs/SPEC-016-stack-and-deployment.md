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
- **Tests:** Vitest + React Testing Library, colocated next to the source files.
  Default environment is `node`; DOM-dependent tests opt into `happy-dom` via a
  per-file `@vitest-environment` pragma (jsdom is not used). `npm test` type-checks
  (`tsc -b`) before running the suite, so type errors fail tests, not just builds.
  TDD is mandatory (see `project/workflow.md`).
- **Deployment:** static build to GitHub Pages under the base path
  `/done-at-timer/`, automated by GitHub Actions on pushes to `main`. The workflow
  runs the full test suite (including the type-check) and halts before deploying on
  any failure; it can also be triggered manually from the Actions tab
  (`npm run deploy` exists as a local fallback).
- **Constraint reminder:** static hosting only, no backend ([SPEC-001]).

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-004: corrected test setup (node + happy-dom, not jsdom; type-check inside
  `npm test`) and detailed the CI gate, per the test_optimization and
  github_actions_deploy tracks (2026-07-02)
