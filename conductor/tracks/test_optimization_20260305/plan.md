# Implementation Plan: Test Infrastructure Optimization (Fast Tests)

> **Methodology:** Strict TDD (Red → Green → Refactor) applied to infrastructure changes.
> Each migration is proven file-by-file with `// @vitest-environment` pragmas before any global config change. The global config is the **Refactor** step — an extraction of what was already proven locally.

## Phase 1: Prove `node` environment for pure-logic tests

Each file is migrated individually following the TDD cycle:

### Cycle 1 — Unblock `node` environment via setup guard
- [x] Task: **Red** — Pick one pure-logic test (e.g. `useTaskStore.test.ts`), add `// @vitest-environment node` pragma at line 1 → run it → observe failure (setupTests.ts references `window`). 2b73e54
- [x] Task: **Green** — Add `typeof window !== 'undefined'` guard around DOM-specific code in `src/setupTests.ts` → re-run → test passes. abd24ec
- [x] Task: **Refactor** — Review `setupTests.ts` for any other code that needs guarding. a1b14fb

### Cycle 2 — Migrate remaining pure-logic tests to `node`
- [ ] Task: **Red** — For each remaining pure-logic test file (`src/store/*.test.ts`, `src/utils/time.test.ts`), add `// @vitest-environment node` pragma → run → observe pass or fail.
- [ ] Task: **Green** — For any file that fails: diagnose the DOM dependency. Either fix the test to not depend on DOM, or mark it as requiring a DOM environment (it stays on jsdom for now).
- [ ] Task: **Refactor** — Remove any unnecessary DOM references found during the audit.

### Cycle 3 — Audit edge-case files
- [ ] Task: **Red** — Add `// @vitest-environment node` pragma to `src/utils/notificationService.test.ts` and `src/pwa.test.ts` → run → observe result.
- [ ] Task: **Green** — If they fail, remove the pragma (they need DOM). If they pass, keep the pragma.
- [ ] Task: Conductor - User Manual Verification 'Pure-logic tests on node environment' (Protocol in workflow.md)

## Phase 2: Prove `happy-dom` for DOM-dependent tests

### Cycle 4 — Install happy-dom and prove on a single file
- [ ] Task: **Red** — Pick one component test (e.g. `TaskInput.test.tsx`), change its pragma to `// @vitest-environment happy-dom` → run → fails (happy-dom not installed).
- [ ] Task: **Green** — Install `happy-dom` as a dev dependency → re-run → test passes.
- [ ] Task: **Refactor** — Verify happy-dom + `@testing-library/react` compatibility on this file.

### Cycle 5 — Migrate all DOM-dependent tests to happy-dom
- [ ] Task: **Red** — For each remaining DOM-dependent test file (`src/components/**`, `src/hooks/**`, `src/integration*`, `src/App.test.tsx`), add `// @vitest-environment happy-dom` pragma → run → observe pass or fail.
- [ ] Task: **Green** — For any file that fails: fix the happy-dom incompatibility, or keep it on jsdom as a last resort.
- [ ] Task: **Refactor** — Document any files that could not migrate from jsdom (if any).
- [ ] Task: Conductor - User Manual Verification 'DOM tests on happy-dom' (Protocol in workflow.md)

## Phase 3: Extract to global config (the big Refactor)

Now that every file has a proven pragma, extract the pattern into `vite.config.ts` and remove the pragmas.

- [ ] Task: **Red** — Remove all per-file `// @vitest-environment` pragmas → run full suite → tests fail (back to default jsdom for all).
- [ ] Task: **Green** — Update `vite.config.ts`: set `environment: 'node'` as default, add `environmentMatchGlobs` mapping DOM test paths to `happy-dom` (and `jsdom` for any exceptions found in Phase 2) → run full suite → all tests pass.
- [ ] Task: **Refactor** — Simplify `environmentMatchGlobs` patterns (merge overlapping globs, remove redundancies).
- [ ] Task: Conductor - User Manual Verification 'Global config extraction' (Protocol in workflow.md)

## Phase 4: Cleanup & Benchmark

- [ ] Task: Remove `jsdom` from `devDependencies` if no test file requires it.
- [ ] Task: Run the full test suite and record execution time and infrastructure overhead. Compare against baseline (91s wall / 530s cumulative overhead).
- [ ] Task: Conductor - User Manual Verification 'Cleanup & Final Verification' (Protocol in workflow.md)
