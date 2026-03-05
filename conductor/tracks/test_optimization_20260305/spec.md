# Specification: Test Infrastructure Optimization (Fast Tests)

## 1. Overview
The current test suite suffers from high infrastructure overhead (~530s cumulative). This track aims to optimize test execution by switching the default environment to `node` for pure logic tests and migrating DOM-dependent tests from `jsdom` to `happy-dom`.

### Baseline (measured 2026-03-05)
| Metric | Value |
|--------|-------|
| Total wall time | ~91s |
| Environment (cumulative) | 361.77s |
| Import (cumulative) | 107.56s |
| Setup (cumulative) | 59.64s |
| Tests (cumulative) | 21.71s |
| Test files | 35 |

## 2. Goals & Functional Requirements
- **Goal:** Reduce infrastructure overhead from ~530s to the minimum possible.
- **Goal:** Improve developer productivity by providing faster feedback loops.

### Functional Requirements:
- **Default Environment:** Switch the default Vitest environment to `node`.
- **Environment Mapping:** Configure `environmentMatchGlobs` in `vite.config.ts` to use `happy-dom` for known DOM-dependent paths:
  - `src/components/**`
  - `src/hooks/**`
  - `src/integration*`
  - `src/App.test.*`
  - Other files that require DOM after per-file audit (see Phase 2).
- **Environment Migration:** Replace `jsdom` with `happy-dom` in all DOM-dependent tests.
- **Setup File Guard:** Keep a single `src/setupTests.ts` and wrap DOM-specific code (e.g., `matchMedia` mock) in a `typeof window !== 'undefined'` guard. This avoids the complexity of multiple setup files while keeping the setup safe for the `node` environment.
- **Dependency Update:** Install `happy-dom` and remove `jsdom` if no longer used.

## 3. Non-Functional Requirements
- **Maintainability:** Clear separation between logic-only and UI/DOM tests.
- **Performance:** Significant reduction in total test execution time.

## 4. Acceptance Criteria
- [ ] `vite.config.ts` uses `node` as the default `test.environment`.
- [ ] `environmentMatchGlobs` correctly maps UI-related tests to `happy-dom`.
- [ ] `src/setupTests.ts` uses a conditional guard for DOM-specific mocks.
- [ ] Total infrastructure overhead (environment creation + imports + setup) is significantly reduced vs. baseline.
- [ ] All existing tests pass without regressions.
- [ ] `jsdom` is no longer a dependency of the project (if possible).

## 5. Out of Scope
- Rewriting existing tests to improve their internal logic (unless necessary for the migration).
- Adding new feature tests.
