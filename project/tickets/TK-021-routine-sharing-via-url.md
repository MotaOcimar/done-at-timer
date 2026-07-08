---
id: TK-021
title: Share and import routines via a shareable URL
type: feature
status: done
specs: [SPEC-011, SPEC-013]
---

# Share and import routines via a shareable URL

## Context

Users want their routines on more than one device. TK-003 researched the options
and concluded: no live sync (needs infrastructure that violates [SPEC-001]);
instead, one-shot sharing by encoding the routine in a URL. The payload is small
enough (a name plus `{title, duration}` pairs) that realistic routines fit
comfortably within browser and messenger URL limits. See TK-003's recommendation
for the full rationale — those decisions are settled and not reopened here.

## Acceptance criteria

- [x] Every saved routine offers a **Share** action that produces a URL carrying
      the routine (name + tasks with durations). The user can copy it or hand it
      to the system share sheet where available.
- [x] Opening that URL in the app — any device, any browser — shows a **preview**
      of the incoming routine (name, tasks, durations, total estimated minutes)
      and asks for confirmation. Nothing is saved without the user's explicit
      "import".
- [x] Confirming adds the routine to the saved routines ([SPEC-011]); declining
      leaves the device's data untouched.
- [x] After importing or declining, reloading the page does **not** re-trigger the
      prompt.
- [x] Importing never silently overwrites an existing routine (exact collision
      behavior decided in Design).
- [x] A corrupted, truncated, or hand-edited payload produces a clear error
      message and leaves the app fully functional.
- [x] Works entirely from the static GitHub Pages deployment — no backend
      ([SPEC-001]), payload never sent to any server (fragment stays client-side).

## Spec changes required

- [SPEC-011]: routines gain share/import behavior; the "one device only"
  known limitation is rewritten (sharing exists; live sync still doesn't).
- [SPEC-013]: the "data lives in this browser on this device" boundary gains the
  share-link exception as the sanctioned way to move a routine across devices.

## Design

Settled by TK-003 (not to be reopened):

- Sharing is one-shot via URL; no P2P/CRDT sync, no file export/import.
- The payload travels in the URL **fragment** (`#…`) so it never reaches server
  logs.

Dilemmas resolved with the user (2026-07-03):

- **Encoding: JSON → UTF-8 → base64url, carried as `#r=<payload>`, with a version
  field inside the JSON (`{ v: 1, name, tasks }`).** No compression: a realistic
  routine is a few hundred bytes (TK-003), so a compression library would add a
  dependency to save nothing that matters. The `v` field lets a future format
  change keep old links importable. base64url (not plain base64) because `+`/`/`
  are unsafe in URLs and messengers.
- **Name collision: allow duplicates, no rename, no prompt.** The app already
  permits duplicate names — [SPEC-011] "saving always creates a new routine" and
  the store keys routines by generated `id`, never by name. Import behaves exactly
  like save: fresh `id`, name kept as-is. Nothing can be overwritten by
  construction, which satisfies the "never silently overwrites" criterion.
- **Share action: an icon button on each routine row in the Control Center,
  next to the existing delete button ([SPEC-012]).** Tapping it uses the system
  share sheet (`navigator.share`) when available, otherwise copies the URL to the
  clipboard with brief visual feedback. Import preview is a centered confirmation
  modal in the same style as the existing load/delete confirmations (name, task
  list with durations, total minutes, Import / Cancel).
- **Fragment lifecycle: read `location.hash` once on app load; after the user
  imports or declines, remove the fragment via `history.replaceState`** so reload
  and bookmark don't re-prompt. A malformed payload shows an error modal and the
  fragment is cleared the same way.
- **SOLID note:** `navigator.share`/clipboard and URL/history access go behind
  small abstractions (same pattern as `src/utils/notificationService.ts`) so tests
  can mock them.

Out of scope:

- File export/import (deferred by TK-003).
- Sharing anything other than a single routine (no bulk export, no task-list
  sharing, no preferences).
- Any change to routine load/save/delete semantics ([SPEC-011] core behavior).

## Plan

Phase 1 — payload codec (pure logic):

- [x] TDD `src/utils/routineShare.ts`: encode (routine → base64url string) and
      decode (string → validated `{ name, tasks }` or typed error). Cases:
      round-trip, unicode titles, version field, truncated/corrupted/hand-edited
      payloads, empty task list rejected. (c2d0ec2)

Phase 2 — store:

- [x] TDD an `importRoutine(name, tasks)` action in `useTaskStore`: appends with a
      fresh `id`; duplicate names allowed; persisted like any routine. (abba3b9)

Phase 3 — share action:

- [x] TDD a share-target abstraction (share sheet / clipboard fallback) following
      the `notificationService` pattern. (ad747f4)
- [x] TDD the Share button on each routine row in `ControlCenter`, wiring codec +
      abstraction; feedback state when falling back to clipboard copy. (ad747f4)

Phase 4 — import flow:

- [x] TDD a URL-fragment abstraction (read hash on load, clear via
      `history.replaceState`). (5423b0d)
- [x] TDD the import preview modal (routine name, tasks, durations, total; Import
      / Cancel) and the malformed-payload error state; fragment cleared on every
      outcome. (5423b0d)

Phase 5 — close out:

- [x] Update [SPEC-011] (share/import behavior, rewrite the one-device
      limitation) and [SPEC-013] (share-link exception to the on-device
      boundary), with log lines; verify `npm run lint`, `npm run check`,
      `npm test`, `npm run build`; mark this ticket done. (closing commit)

## Notes

Origin: TK-003 research outcome; user request on 2026-07-03.

Verification at close: 282 tests passing, `npm run lint` clean,
`npm run build` clean. `npm run check` (Prettier) fails repo-wide on ~150
pre-existing files — every file this ticket created is Prettier-clean; the
repo-wide cleanup is TK-022.
