# Specification: Deployment Setup

## 1. Goal
Make the "Done-At" Timer application accessible via a public URL using GitHub Pages.

## 2. Requirements
- **Host:** GitHub Pages.
- **Build:** Vite build process must be compatible with GH Pages.
- **Workflow:** Automated or manual deployment script using `gh-pages` package.
- **Base Path:** Must handle the repository name `/done-at-timer/` as the base path.
- **Domain:** `https://MotaOcimar.github.io/done-at-timer/`

## 3. Tech Stack Changes
- Add `gh-pages` package to `devDependencies`.
- Add `predeploy` and `deploy` scripts to `package.json`.
- Update `vite.config.ts` base configuration.
