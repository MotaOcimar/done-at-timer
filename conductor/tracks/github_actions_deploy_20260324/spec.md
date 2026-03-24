# Specification: GitHub Actions CI/CD Setup

## 1. Overview
Automate the deployment process of the "Done-At" Timer application to GitHub Pages whenever code is pushed to the `main` branch. This ensures that the public version of the application is always up-to-date with the latest verified changes.

## 2. Functional Requirements
- **Type-check in the test loop:** `npm test` must include TypeScript type-checking (`tsc -b`) before running Vitest, so type errors are caught during development — not only at build time. This closes the current gap where `vitest run` passes despite broken types.
- **Automated Trigger:** The deployment workflow must trigger on every `push` to the `main` branch.
- **Manual Trigger:** The workflow must also support `workflow_dispatch` to allow manual deploys from the Actions tab.
- **CI Pipeline:**
  - Check out the repository.
  - Set up a Node.js environment.
  - Install dependencies using `npm ci` for consistency.
  - **Testing:** Run all existing tests (`npm test`). Since `npm test` now includes type-checking, this single step validates both correctness and type safety. The build and deploy should halt if any tests fail.
  - **Build:** Execute `npm run build` to generate the production assets.
- **PWA Asset Validation:** Ensure that the PWA assets (service worker, manifest, icons) are correctly generated in the `dist/` folder.
- **Automated Deployment:** Deploy the contents of the `dist/` directory to GitHub Pages using GitHub's official deployment actions (`actions/upload-pages-artifact` + `actions/deploy-pages`).

## 3. Non-Functional Requirements
- **Security:** Use GitHub's official Pages actions with OIDC token verification (`id-token: write`). No third-party actions for the deployment step — eliminates supply-chain risk.
- **Performance:** Utilize caching for `npm` dependencies to speed up subsequent workflow runs.
- **Reliability:** The site should remain accessible while the deployment is in progress.

## 4. Acceptance Criteria
- [ ] `npm test` runs `tsc -b` before `vitest run` — type errors fail the test command.
- [ ] All pre-existing TypeScript errors are fixed; `npm test` passes cleanly.
- [ ] A `.github/workflows/deploy.yml` file exists in the repository.
- [ ] Pushing a commit to `main` triggers a GitHub Action.
- [ ] The action successfully runs tests, builds the project, and deploys via GitHub's Pages deployment API.
- [ ] The public URL (https://MotaOcimar.github.io/done-at-timer/) updates with the new changes.
- [ ] PWA functionality remains intact after the automated deploy.

## 5. Out of Scope
- Automated deployment for other branches (e.g., development, feature branches).
- Integration with external staging environments.
- Rollback automation (manual revert of commits will trigger a new deploy).
