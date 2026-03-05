# Implementation Plan: Test Infrastructure Optimization (Fast Tests)

## Phase 1: Environment Setup & Tooling
This phase focuses on installing the necessary dependencies and setting up the initial file structure for the environment-aware testing.

- [ ] Task: Install `happy-dom` and verify its integration with Vitest.
- [ ] Task: Split `src/setupTests.ts` into `src/setupTests.node.ts` and `src/setupTests.dom.ts`.
- [ ] Task: Update `vite.config.ts` to set default environment to `node` and define `environmentMatchGlobs` for DOM tests.
- [ ] Task: Conductor - User Manual Verification 'Environment Setup & Tooling' (Protocol in workflow.md)

## Phase 2: Logic-Only Test Optimization
This phase ensures that tests that don't require a DOM environment (Zustand stores, pure utilities) correctly run in the `node` environment, saving significant setup time.

- [ ] Task: Identify and verify all pure logic tests (e.g., `src/store/`, `src/utils/`) pass in the `node` environment.
- [ ] Task: Confirm that infrastructure overhead for these tests is drastically reduced.
- [ ] Task: Conductor - User Manual Verification 'Logic-Only Test Optimization' (Protocol in workflow.md)

## Phase 3: DOM-Dependent Test Migration (Happy-dom)
This phase migrates UI and hook tests to the `happy-dom` environment, which is significantly faster than `jsdom`.

- [ ] Task: Migrate `src/components/**` and `src/hooks/**` tests to `happy-dom`.
- [ ] Task: Verify all UI-related tests pass in the `happy-dom` environment.
- [ ] Task: Conductor - User Manual Verification 'DOM-Dependent Test Migration (Happy-dom)' (Protocol in workflow.md)

## Phase 4: Cleanup & Final Verification
Final cleanup of unused dependencies and a comprehensive performance comparison.

- [ ] Task: Remove `jsdom` dependency if no longer required.
- [ ] Task: Run the full test suite and record total execution time and infrastructure overhead.
- [ ] Task: Conductor - User Manual Verification 'Cleanup & Final Verification' (Protocol in workflow.md)
