# Implementation Plan: GitHub Actions Deployment Automation

## Objective
Implement a GitHub Actions workflow to automate building, testing, and deploying the "Done-At" Timer application to GitHub Pages whenever changes are pushed to the `main` branch.

## Technical Context
- `.github/workflows/` — does not exist yet; needs to be created.
- `package.json` — existing scripts used by the pipeline:
  - `"test": "vitest run"` (line 13)
  - `"build": "tsc -b && vite build"` (line 8)
  - `"deploy": "gh-pages -d dist"` (line 16) — will be renamed to `deploy:manual` (manual fallback).
  - `gh-pages` package (devDependencies, line 48) — stays for manual fallback.
- `vite.config.ts` — `base: '/done-at-timer/'` (line 10), already correct for GitHub Pages.
- `vite-plugin-pwa` generates `sw.js` (default filename, no custom `filename` option set) and `manifest.webmanifest`.
- Deployment method: **GitHub's official Pages actions** (`actions/upload-pages-artifact@v4` + `actions/deploy-pages@v4`).
  - Requires `pages: write` and `id-token: write` permissions.
  - Does **not** push to a `gh-pages` branch — uses GitHub's Pages deployment API instead.
  - Requires GitHub Pages source to be set to **"GitHub Actions"** in repo Settings → Pages.
- `actions/configure-pages@v5` — used in the build job to inject GitHub Pages metadata (base URL, etc.) into the build environment. Required by `actions/upload-pages-artifact`.
- Node.js version: **22** (current LTS, compatible with Vite 7.x / TypeScript 5.9).

**Design decision — official actions over third-party:** We use `actions/upload-pages-artifact` + `actions/deploy-pages` (maintained by GitHub) instead of `peaceiris/actions-gh-pages` (third-party). This eliminates supply-chain risk from third-party action tags being moved, avoids needing `contents: write`, and uses GitHub's own deployment API with OIDC token verification.

**Design decision:** Lint (`eslint`) and format check (`prettier --check`) are intentionally **not** included in the pipeline to keep it fast. These remain the developer's local responsibility.

**Methodology note:** The CI/CD workflow itself is pure YAML configuration where TDD does not apply — validation is done via GitHub Actions execution and manual inspection. However, Phase 0 modifies `package.json` and fixes TypeScript errors in test files, which is validated by running `npm test`.

## Implementation Steps

### Phase 0: Tighten the Test Loop & Fix Existing Type Errors
Currently `npm test` runs only `vitest run` — it does not type-check. This means type errors go unnoticed until `npm run build`, which developers run less frequently. We close this gap first, then fix the errors it surfaces.

1. [x] **Add type-checking to `npm test`**: In `package.json`, change `"test": "vitest run"` → `"test": "tsc -b && vitest run"`. 7359540
2. [x] **Verify `npm test` now catches type errors:** Run `npm test` — it should fail with the known TS errors (confirming the new gate works). 7359540
3. [x] **Fix all TypeScript errors** surfaced by the tighter test command: 87e640e
    - `src/components/TaskCard.test.tsx` — `onDelete` prop no longer exists in `TaskCardProps` (multiple occurrences).
    - `src/components/TaskCard.time.test.tsx` — same `onDelete` issue.
    - `src/components/TaskItem.tsx:187` — function call with 2 args, expects 0.
    - `src/components/TaskList.test.tsx:6` — unused `TaskItem` import.
    - `src/hooks/useSwipeToReveal.test.ts` — `string` assigned to `null` type (lines 82, 98, 206).
4. [x] **Verify `npm test` passes cleanly** (type-check + all tests green). 87e640e
5. [x] **Verify `npm run build` also passes** (defense in depth). 87e640e

### Phase 1: Preparation and Configuration
1. [ ] **Configure GitHub Pages Source (manual):** In the repository Settings → Pages, set the source to **"GitHub Actions"** (not "Deploy from a branch"). This is required for the official `actions/deploy-pages` action. This step must be done by a repo admin before the first workflow run.
2. [x] **Simplify deploy script:** In `package.json`, replace both `predeploy` and `deploy` with a single `deploy:manual` script: `"deploy:manual": "npm run build && gh-pages -d dist"`. Delete `predeploy` entirely — npm's `pre<script>` auto-hook doesn't fire for colon-namespaced scripts, so keeping it as a separate entry would be dead weight.
3. [x] **Verify `package-lock.json` exists** — required by `npm ci` in the workflow.
4. [x] Task: Manual verification
    - [x] Check `dist/` folder (from Phase 0 build) contains `index.html`, `sw.js`, and `manifest.webmanifest`

### Phase 2: Create Workflow Definition
1. [x] **Create Directory Structure:** Create `.github/workflows/` directory.
2. [x] **Define Deploy Workflow:** Create `.github/workflows/deploy.yml` with:
    - Name: `Deploy to GitHub Pages`.
    - Trigger: `push` on `main` branch + `workflow_dispatch` (permite deploy manual pela aba Actions).
    - Permissions: `contents: read`, `pages: write`, `id-token: write`.
    - Concurrency: `group: pages`, `cancel-in-progress: true` (prevents parallel deploys from racing).
    - **Job 1: `build`** on `ubuntu-latest`:
        - [x] Checkout code (`actions/checkout@v4`).
        - [x] Setup Node.js (`actions/setup-node@v4`) with `node-version: 22` and `npm` caching.
        - [x] Configure Pages (`actions/configure-pages@v5`).
        - [x] Install dependencies (`npm ci`).
        - [x] Run tests (`npm test`).
        - [x] Run build (`npm run build`).
        - [x] Verify PWA assets exist (`test -f dist/sw.js && test -f dist/manifest.webmanifest`).
        - [x] Upload pages artifact (`actions/upload-pages-artifact@v4`, path: `./dist`).
    - **Job 2: `deploy`** on `ubuntu-latest`, `needs: build`:
        - Environment: `github-pages` (links deployment to GitHub Pages environment, `url: ${{ steps.deployment.outputs.page_url }}`).
        - [x] Deploy to GitHub Pages (`actions/deploy-pages@v4`).
3. [x] Task: Manual verification
    - [x] Validate YAML syntax (e.g., paste into https://www.yamllint.com/ or use a local linter)
    - [x] Review the file to confirm trigger, permissions, and steps match the spec

### Phase 3: Verification and Finalization
**Prerequisite:** Phase 1 step 1 (GitHub Pages source set to "GitHub Actions") must be completed by a repo admin before the first workflow run will succeed.

1. [~] **Push to Main:** Merge/push the workflow file to `main` to trigger the first automated deployment.
2. [ ] **Monitor Action:** Check the "Actions" tab in the repository for the triggered workflow run.
3. [ ] Task: Manual verification
    - [ ] Open the repository's "Actions" tab → the "Deploy" workflow appears and the run shows a green checkmark
    - [ ] Inspect the run steps → test, build, upload artifact, and deploy steps all succeeded
    - [ ] Open https://MotaOcimar.github.io/done-at-timer/ → site loads with the latest changes
    - [ ] DevTools → Application → Service Workers → SW is registered and active
    - [ ] DevTools → Application → Manifest → manifest loaded with correct icons
