# Specification: Test Infrastructure Optimization (Fast Tests)

## 1. Overview
The current test suite suffers from high infrastructure overhead (~530s cumulative). This track aims to optimize test execution by switching the default environment to `node` for pure logic tests and migrating DOM-dependent tests from `jsdom` to `happy-dom`.

## 2. Goals & Functional Requirements
- **Goal:** Reduce infrastructure overhead from ~530s to the minimum possible.
- **Goal:** Improve developer productivity by providing faster feedback loops.

### Functional Requirements:
- **Default Environment:** Switch the default Vitest environment to `node`.
- **Environment Mapping:** Configure `environmentMatchGlobs` in `vite.config.ts` to use `happy-dom` for:
  - `src/components/**`
  - `src/hooks/**`
  - `src/integration*`
  - `App.test.*`
- **Environment Migration:** Replace `jsdom` with `happy-dom` in all DOM-dependent tests.
- **Setup File Splitting:** Split `src/setupTests.ts` into:
  - `src/setupTests.node.ts`: Core setup for non-DOM tests (if any).
  - `src/setupTests.dom.ts`: DOM-specific setup (e.g., `@testing-library/jest-dom`, Mocks for `window`).
- **Dependency Update:** Install `happy-dom` and remove `jsdom` if no longer used.

## 3. Non-Functional Requirements
- **Maintainability:** Clear separation between logic-only and UI/DOM tests.
- **Performance:** Significant reduction in total test execution time.

## 4. Acceptance Criteria
- [ ] `vite.config.ts` uses `node` as the default `test.environment`.
- [ ] `environmentMatchGlobs` correctly maps UI-related tests to `happy-dom`.
- [ ] Total infrastructure overhead (environment creation + imports + setup) is significantly reduced.
- [ ] All existing tests pass without regressions.
- [ ] `jsdom` is no longer a dependency of the project (if possible).

## 5. Out of Scope
- Rewriting existing tests to improve their internal logic (unless necessary for the migration).
- Adding new feature tests.
