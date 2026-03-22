# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in the track's `plan.md` (located in `conductor/tracks/<track_id>/plan.md`)
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` _before_ implementation
3. **Test-Driven Development:** Write unit tests before implementing functionality
4. **High Code Coverage:** Aim for >80% code coverage for all modules
5. **User Experience First:** Every decision should prioritize user experience
6. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (tests, linters) to ensure single execution.

## Plan Creation

Before any implementation begins, a **plan** must be created from the track's **spec**. The plan is the bridge between _what_ to build (spec) and _how_ to build it (code). Its goal is to make execution as mechanical as possible — the developer (human or AI) should be able to follow the plan step-by-step without having to make architectural or testing decisions on the fly.

### Prerequisites

Before writing a plan, read and internalize:
- The track's `spec.md` (what to build)
- `product.md` and `product-guidelines.md` (user-facing context)
- `tech-stack.md` (available tools and libraries)
- The current codebase (files, patterns, and conventions already in place)

### Plan Structure

Every `plan.md` follows this structure:

```markdown
# Implementation Plan: [Feature Name]

## Technical Context
[Relevant files, libraries, current state — with file paths and line numbers]

## Phase 1: [Title]
- [ ] Task: **RED** — [test description]
- [ ] Task: **GREEN** — [implementation description]
- [ ] Task: **REFACTOR** — [cleanup description]
- [ ] Task: Manual verification
    - [ ] [Concrete step: what to do and what to expect]
    - [ ] [Concrete step: what to do and what to expect]

## Phase 2: [Title]
...
```

### Technical Context

The plan starts with a **Technical Context** section that maps the current state of the codebase relevant to the track. This gives the developer immediate orientation without having to explore. Include:
- File paths and line numbers for code that will be modified
- Library versions and existing configurations
- Store actions, hooks, or utilities that will be reused
- Any constraints or gotchas discovered during plan research

### Phase Decomposition

Break the spec into **phases** — each phase is a deployable, verifiable increment:
- Each phase should deliver a cohesive unit of functionality that can be manually verified
- Phases are sequential — Phase 2 may depend on Phase 1's output
- Every phase ends with a **Manual verification** task containing concrete, specific sub-steps (see below)
- Name phases descriptively: `Phase 1: Core Hook Logic`, not `Phase 1: Part A`

### Task Granularity

Tasks are the atomic units of work. Each task should be completable in a single commit:
- Use imperative names: "Create...", "Remove...", "Wire...", "Add..."
- A task that requires more than ~3 files changed is likely too coarse — split it
- A task that changes a single line is likely too fine — merge it with related work
- Include specific file paths, function names, and line numbers when known

### TDD by Design

TDD is not left to the developer's discretion — it is **embedded in the plan** as explicit tasks:

- **RED tasks** (`Task: **RED** — ...`) define _what tests to write_ and _what they should assert_. Be specific: "Write test asserting `useSwipeToReveal` returns `isRevealed: false` initially", not "Write tests for swipe".
- **GREEN tasks** (`Task: **GREEN** — ...`) define _what to implement_ to make the RED tests pass. These describe the minimum implementation, not the ideal one.
- **REFACTOR tasks** (`Task: **REFACTOR** — ...`) define cleanup opportunities: extract duplication, rename for clarity, simplify conditionals. These are optional but should be included when the GREEN implementation is expected to be rough.

**When TDD doesn't apply:** Pure visual changes (CSS-only, animation tuning) that cannot be meaningfully validated by the test environment (happy-dom/jsdom) do not need RED/GREEN/REFACTOR labels. State this explicitly in the task: _"No TDD — pure CSS change, verified manually."_

### SOLID by Design

Architectural decisions that involve SOLID principles must be made **during plan creation**, not during implementation. The developer should not have to decide whether to create an abstraction — the plan should already specify it.

Apply SOLID judiciously:
- **SRP (Single Responsibility):** If a component or hook already manages multiple concerns, the plan should extract new logic into a dedicated unit. Example: _"Swipe gesture logic lives in a dedicated `useSwipeToReveal` hook — `TaskItem` already manages DnD, timer, and task lifecycle."_
- **DIP (Dependency Inversion):** When wrapping a browser API (Notification, Vibration, ServiceWorker), the plan should specify an abstraction layer so tests can mock it. Example: _"Create `src/utils/haptics.ts` with a `triggerHaptic()` wrapper that gates behind `'vibrate' in navigator`."_
- **ISP / OCP / LSP:** Apply only when they solve a concrete problem, not preemptively.

**The over-engineering guard:** Before adding an abstraction to the plan, ask: _"Does this solve a problem that exists right now, or one I'm imagining?"_ A 3-line inline solution is better than a premature abstraction. If the only consumer is one file, an interface/abstraction layer is overhead. Call it out when you choose NOT to abstract — this shows the decision was deliberate: _"Acceptable coupling — only `TaskItem` + `useSwipeToReveal` would need to change if the library were ever swapped."_

### Manual Verification Steps

Every phase ends with a **Manual verification** task. Unlike RED/GREEN/REFACTOR, this task isn't about code — it tells the user exactly what to do in the browser and what to expect. The steps are written **during plan creation**, not improvised at execution time.

Write steps that are:
- **Actionable:** "Add 3 tasks, start the first one, swipe the second left" — not "verify it works"
- **Observable:** "A red Delete button appears behind the card" — not "the swipe works correctly"
- **Specific to the phase:** Test what this phase introduced, not the whole app

Example for a swipe-to-delete phase:
```markdown
- [ ] Task: Manual verification
    - [ ] Add 3 tasks. Swipe the middle task from right to left → a red "Delete" button appears behind the card
    - [ ] Tap "Delete" → the task is removed from the list
    - [ ] Swipe a task left, then swipe it back right → the Delete button hides, task stays
    - [ ] Start a task (make it active). Swipe it left → Delete still works on active tasks
    - [ ] Complete a task. Try swiping it → nothing happens (completed tasks don't swipe)
    - [ ] On mobile: swipe feels smooth, no conflict with vertical scrolling
```

For PWA/Service Worker changes, include build + preview steps:
```markdown
- [ ] Task: Manual verification
    - [ ] Run `npm run build && npm run preview`, open `http://localhost:4173/done-at-timer/`
    - [ ] DevTools → Application → Service Workers → SW is registered and active
    - [ ] Toggle offline in DevTools Network tab → app still loads and functions
```

### Conflict and Strategy Sections

When the feature involves interactions that could conflict (e.g., gestures competing for the same input surface), add a **strategy section** between Technical Context and the phases. This section:
- Enumerates the conflicting layers and their priority order
- Describes the resolution approach with enough detail that the developer doesn't need to re-derive it
- Calls out non-obvious timing constraints (e.g., _"Direction is unknown at `pointerdown` time — determined only after first `pointermove`"_)

### Methodology Notes

If a phase uses a non-standard approach (e.g., skipping TDD for CSS, using a spike before RED), add a brief methodology note at the phase level. Example: _"Animation tuning is aesthetic (no tests needed), but haptic feedback is new functionality and follows TDD."_

## Task Workflow

All tasks follow a strict lifecycle:

### Standard Task Workflow

1. **Select Task:** Choose the next available task from `plan.md` in sequential order

2. **Mark In Progress:** Before beginning work, edit `plan.md` and change the task from `[ ]` to `[~]`

3. **Execute the Task:**
   - The plan already specifies whether this task is **RED**, **GREEN**, **REFACTOR**, or non-TDD. Follow the plan's instructions — do not improvise the testing strategy.
   - **RED tasks:** Write the tests exactly as described in the plan. Run them and confirm they fail. Do not proceed to the next task until the tests fail as expected.
   - **GREEN tasks:** Write the minimum code to make the RED tests pass. Run the test suite and confirm all tests pass.
   - **REFACTOR tasks:** Improve clarity, remove duplication, or simplify — without changing external behavior. Rerun tests to confirm they still pass.
   - **Non-TDD tasks** (CSS-only, animation tuning, documentation): Execute as described. These tasks should be explicitly marked in the plan as not requiring TDD.

4. **Verify Coverage:** Run coverage reports:

   ```bash
   npx vitest run --coverage
   ```

   Target: >80% coverage for new code.

5. **Document Deviations:** If implementation differs from tech stack:
   - **STOP** implementation
   - Update `tech-stack.md` with new design
   - Add dated note explaining the change
   - Resume implementation

6. **Update Plan with Completion:**
    - Read `plan.md`, find the line for the completed task, and update its status from `[~]` to `[x]`.

7. **Commit All Changes (code + plan):**
   - Stage all code changes **and** the updated `plan.md` together.
   - Propose a clear, concise commit message e.g, `feat(ui): Add swipe-to-delete gesture on task cards`.
   - Perform a single commit.

8. **Attach Task Summary with Git Notes:**
   - **Step 8.1: Get Commit Hash:** Obtain the hash of the _just-completed commit_ (`git log -1 --format="%H"`).
   - **Step 8.2: Draft Note Content:** Create a detailed summary for the completed task. This should include the task name, a summary of changes, a list of all created/modified files, and the core "why" for the change.
   - **Step 8.3: Attach Note:** Use the `git notes` command to attach the summary to the commit.
     ```bash
     # The note content from the previous step is passed via the -m flag.
     git notes add -m "<note content>" <commit_hash>
     ```

9. **Record Commit SHA in Plan (no commit needed):**
    - Read `plan.md` again, find the completed task line, and append the first 7 characters of the commit hash.
    - **Do not commit this change.** The SHA annotation will be included naturally in the next task's commit or during phase review.

### Phase Completion Verification and Checkpointing Protocol

**Trigger:** This protocol is executed immediately after a task is completed that also concludes a phase in `plan.md`.

1.  **Announce Protocol Start:** Inform the user that the phase is complete and the verification and checkpointing protocol has begun.

2.  **Ensure Test Coverage for Phase Changes:**
    - **Step 2.1: Determine Phase Scope:** To identify the files changed in this phase, you must first find the starting point. Read `plan.md` to find the Git commit SHA of the _previous_ phase's checkpoint. If no previous checkpoint exists, the scope is all changes since the first commit.
    - **Step 2.2: List Changed Files:** Execute `git diff --name-only <previous_checkpoint_sha> HEAD` to get a precise list of all files modified during this phase.
    - **Step 2.3: Verify and Create Tests:** For each file in the list:
      - **CRITICAL:** First, check its extension. Exclude non-code files (e.g., `.json`, `.md`, `.yaml`).
      - For each remaining code file, verify a corresponding test file exists.
      - If a test file is missing, you **must** create one. Before writing the test, **first, analyze other test files in the repository to determine the correct naming convention and testing style.** The new tests **must** validate the functionality described in this phase's tasks (`plan.md`).

3.  **Execute Automated Tests with Proactive Debugging:**
    - Before execution, you **must** announce the exact shell command you will use to run the tests.
    - **Example Announcement:** "I will now run the automated test suite to verify the phase. **Command:** `CI=true npm test`"
    - Execute the announced command.
    - If tests fail, you **must** inform the user and begin debugging. You may attempt to propose a fix a **maximum of two times**. If the tests still fail after your second proposed fix, you **must stop**, report the persistent failure, and ask the user for guidance.

4.  **Present Manual Verification Steps:**
    - Read the **Manual verification** task from the phase in `plan.md` — the concrete steps were already defined during plan creation.
    - Present these steps to the user and start the dev server if needed (`npm run dev`).

5.  **Await Explicit User Feedback:**
    - Ask the user for confirmation: "**Does this meet your expectations? Please confirm with yes or provide feedback on what needs to be changed.**"
    - **PAUSE** and await the user's response. Do not proceed without an explicit yes or confirmation.

6.  **Create Checkpoint Commit:**
    - Stage all changes. If no changes occurred in this step, proceed with an empty commit.
    - Perform the commit with a clear and concise message (e.g., `conductor(checkpoint): Checkpoint end of Phase X`).

7.  **Attach Auditable Verification Report using Git Notes:**
    - **Step 7.1: Draft Note Content:** Create a detailed verification report including the automated test command, the manual verification steps, and the user's confirmation.
    - **Step 7.2: Attach Note:** Use the `git notes` command and the full commit hash from the previous step to attach the full report to the checkpoint commit.

8.  **Get and Record Phase Checkpoint SHA (no commit needed):**
    - **Step 8.1: Get Commit Hash:** Obtain the hash of the _just-created checkpoint commit_ (`git log -1 --format="%H"`).
    - **Step 8.2: Update Plan:** Read `plan.md`, find the heading for the completed phase, and append the first 7 characters of the commit hash in the format `[checkpoint: <sha>]`.
    - **Step 8.3: Write Plan:** Write the updated content back to `plan.md`.
    - **Do not commit this change.** The checkpoint SHA annotation will be included naturally in the next phase's first task commit or during review.

9. **Announce Completion:** Inform the user that the phase is complete and the checkpoint has been created, with the detailed verification report attached as a git note.

### Quality Gates

Before marking any task complete, verify:

- [ ] All tests pass
- [ ] Code coverage meets requirements (>80%)
- [ ] Code follows project's code style guidelines (as defined in `code_styleguides/`)
- [ ] All public functions/methods are documented (JSDoc where non-obvious)
- [ ] Type safety is enforced (TypeScript strict mode, no `any`)
- [ ] No linting or static analysis errors (using the project's configured tools)
- [ ] Works correctly on mobile (if applicable)
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced

## Development Commands

### Setup

```bash
npm install
```

### Daily Development

```bash
npm run dev              # Dev server at http://localhost:5173
npm test                 # Run all tests (single pass)
npm run test:watch       # Run tests in watch mode
npm run lint             # ESLint check
npm run format           # Prettier fix
npx vitest run src/path/to/file.test.ts  # Run a single test file
```

### Before Committing

```bash
npm run check            # Prettier check (no fix)
npm run lint             # ESLint check
CI=true npm test         # Full test suite
npm run build            # TypeScript check + Vite build
```

## Testing Requirements

### Unit Testing

- Every module must have corresponding tests.
- Use appropriate test setup/teardown mechanisms (e.g., fixtures, beforeEach/afterEach).
- Mock external dependencies.
- Test both success and failure cases.

### Integration Testing

- Test complete user flows (add tasks, start timer, complete routine)
- Test state persistence across page reloads (localStorage/Zustand)
- Test PWA lifecycle (install, offline, update)
- Test drag-and-drop and touch gesture interactions

### Mobile Testing

- Test on actual iPhone when possible
- Use Safari developer tools
- Test touch interactions
- Verify responsive layouts
- Check performance on 3G/4G

## Code Review Process

### Self-Review Checklist

Before requesting review:

1. **Functionality**
   - Feature works as specified
   - Edge cases handled
   - Error messages are user-friendly

2. **Code Quality**
   - Follows style guide
   - DRY principle applied
   - Clear variable/function names
   - Appropriate comments

3. **Testing**
   - Unit tests comprehensive
   - Integration tests pass
   - Coverage adequate (>80%)

4. **Security**
   - No hardcoded secrets or API keys
   - User input sanitized (XSS prevention)
   - Dependencies free of known vulnerabilities

5. **Performance**
   - No unnecessary re-renders (React profiler)
   - Assets optimized (images, bundle size)
   - Timer/interval cleanup on unmount

6. **Mobile Experience**
   - Touch targets adequate (44x44px)
   - Text readable without zooming
   - Performance acceptable on mobile
   - Interactions feel native

## Commit Guidelines

### Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintenance tasks

### Examples

```bash
git commit -m "feat(timer): Add intermediate arrival times per task"
git commit -m "fix(ui): Correct arrival clock z-index over modals"
git commit -m "test(store): Add tests for routine save and load"
git commit -m "refactor(ui): Remove drag handle in favor of whole-card drag"
```

## Definition of Done

A task is complete when:

1. All code implemented to specification
2. Unit tests written and passing
3. Code coverage meets project requirements
4. Documentation complete (if applicable)
5. Code passes all configured linting and static analysis checks
6. Works beautifully on mobile (if applicable)
7. Implementation notes added to `plan.md`
8. Changes committed with proper message
9. Git note with task summary attached to the commit

## Emergency Procedures

### Critical Bug in Production

1. Create hotfix branch from main
2. Write failing test for bug
3. Implement minimal fix
4. Test thoroughly including mobile
5. Deploy immediately via `npm run deploy`
6. Document in plan.md

## Deployment Workflow

### Pre-Deployment Checklist

- [ ] All tests passing (`CI=true npm test`)
- [ ] Coverage >80%
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Mobile testing complete
- [ ] Service worker update verified

### Deployment Steps

1. Merge feature branch to main
2. Checkout main and pull latest
3. Run `npm run deploy` (builds and pushes to `gh-pages` branch)
4. Verify at https://\<username\>.github.io/done-at-timer/
5. Test critical paths (add tasks, start timer, arrival clock, offline mode)

### Post-Deployment

1. Verify PWA update prompt appears for returning users
2. Test on mobile device (install, offline, notifications)
3. Gather user feedback
4. Plan next iteration

## Continuous Improvement

- Review workflow weekly
- Update based on pain points
- Document lessons learned
- Optimize for user happiness
- Keep things simple and maintainable
