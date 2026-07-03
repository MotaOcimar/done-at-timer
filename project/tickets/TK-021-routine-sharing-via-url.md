---
id: TK-021
title: Share and import routines via a shareable URL
type: feature
status: open
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

- [ ] Every saved routine offers a **Share** action that produces a URL carrying
      the routine (name + tasks with durations). The user can copy it or hand it
      to the system share sheet where available.
- [ ] Opening that URL in the app — any device, any browser — shows a **preview**
      of the incoming routine (name, tasks, durations, total estimated minutes)
      and asks for confirmation. Nothing is saved without the user's explicit
      "import".
- [ ] Confirming adds the routine to the saved routines ([SPEC-011]); declining
      leaves the device's data untouched.
- [ ] After importing or declining, reloading the page does **not** re-trigger the
      prompt.
- [ ] Importing never silently overwrites an existing routine (exact collision
      behavior decided in Design).
- [ ] A corrupted, truncated, or hand-edited payload produces a clear error
      message and leaves the app fully functional.
- [ ] Works entirely from the static GitHub Pages deployment — no backend
      ([SPEC-001]), payload never sent to any server.

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

Open dilemmas (must be resolved before in-progress):

- Encoding format (e.g. JSON → base64url vs. a compressed variant) and a version
  marker for forward compatibility.
- Name-collision behavior on import (auto-rename vs. prompt).
- Where the Share action lives in the Control Center UI ([SPEC-012]) and what the
  import preview looks like.
- How the fragment is cleared after handling so refresh doesn't re-prompt.

## Plan

(to be written when Design closes)

## Notes

Origin: TK-003 research outcome; user request on 2026-07-03.
