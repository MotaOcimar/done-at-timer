---
name: verify
description: Drive the Done-At Timer app in a headless browser in this PRoot/Termux environment to verify user-facing changes end-to-end.
---

# Verifying Done-At Timer in this environment

## Launch the app

```bash
npm run dev   # http://localhost:5173/done-at-timer/  (note the base path)
```

## Browser: what works and what doesn't

The system chromium (`/usr/sbin/chromium`) is **broken** — built against icu 75,
system has icu 78 (`libicui18n.so.75: cannot open shared object file`). Don't
bother with pacman: no sudo password, and the repo package is the same build.

Use Playwright's arm64 headless shell instead (ICU statically linked). Install
into the scratchpad, not the repo:

```bash
npm i playwright playwright-core
PLAYWRIGHT_BROWSERS_PATH=$PWD/pw-browsers npx playwright install chromium-headless-shell
PLAYWRIGHT_BROWSERS_PATH=$PWD/pw-browsers node your-script.mjs
```

**Required launch args** (PRoot breaks Chromium's process model):

```js
const browser = await chromium.launch({
  args: [
    '--no-sandbox', // sandbox needs userns
    '--no-zygote', // zygote's clone() traps under PRoot
    '--disable-gpu',
    '--disable-gpu-process-crash-limit', // GPU child crash-loops; without this Chromium FATALs after 6 respawns
    '--disable-dev-shm-usage',
  ],
});
```

Gotchas discovered the hard way:

- `--single-process` does NOT work with Playwright (browser exits at connect)
  nor with `--remote-debugging-port` (DevTools server never comes up).
- **No compositor frames** ever render: `page.screenshot()` times out, and
  `requestAnimationFrame` never fires — so Playwright's actionability "stable"
  check hangs forever. **Use `click({ force: true })` on every click.**
  `fill()` works normally. `setInterval`-driven app logic works normally.
- Evidence: capture DOM state instead of pixels — the task card's classes
  (`bg-blue-50` running / `bg-amber-50` overtime / `bg-green-50/50` completed)
  and `textContent` ("N min left" / "N min over").
- `pgrep -f headless_shell` matches your own wrapper shell — use
  `ps aux | grep` and never `pkill -f` (it kills your own session, exit 144).

## Driving the app (selectors)

- Add task: `input[placeholder="What's next?"]`, `input[placeholder="0"]`
  (minutes), button `[aria-label="Add task"]`.
- Start/pause: `[aria-label="Play task"]` / `[aria-label="Pause"]` /
  `[aria-label="Resume"]`. Complete: `[aria-label="Done"]`.
- Card: `[data-testid="task-card"]`. Restart after all done: button text
  "Restart Routine". Clear state between runs: `localStorage.clear()` + reload.
- Timers are wall-clock anchored (SPEC-003): a 1-minute task really takes
  ~60s to overrun — budget script timeouts accordingly.
