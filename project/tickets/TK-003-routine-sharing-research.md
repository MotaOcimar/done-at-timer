---
id: TK-003
title: Routine sharing/sync between devices — viability research
type: idea
status: done
specs: [SPEC-011, SPEC-013, SPEC-001]
---

# Routine sharing/sync between devices

## Context
Routines live on a single device ([SPEC-013] boundary). Users want the same
routines on phone and desktop. Hard constraint: **no backend** ([SPEC-001]) — any
solution must work from a static GitHub Pages site.

## Research questions (must be answered before this graduates to a feature ticket)
- Plan A — real sync without a server: is P2P/CRDT sync viable from a static page
  (WebRTC + free signaling, etc.)? What are the failure modes?
- Plan B — one-shot sharing: export/import file vs. routine encoded in a shareable
  URL. Evaluate: URL length limits per browser/messenger, user perception of huge
  URLs, file format choice, UX friction of each.

## Acceptance criteria (for the research)
- [x] Written recommendation (in this ticket) choosing Plan A or B with rationale.
- [x] Follow-up feature ticket created with concrete acceptance criteria and the
      spec changes it will require (at minimum SPEC-011, SPEC-013): TK-021.

## Recommendation (research outcome, 2026-07-03)

**Plan B — one-shot sharing via a shareable URL.** Follow-up feature ticket: TK-021.

Rationale:

- **The payload is tiny.** A routine is only a name plus a list of
  `{title, duration}` pairs (see `src/types/index.ts`). A realistic 10–15-task
  routine serializes to a few hundred bytes; even base64/URL-encoded it stays well
  under the conservative ~2,000-character URL limit and passes intact through
  WhatsApp/Telegram/e-mail. The "huge scary URL" risk flagged in the research
  questions does not materialize at this payload size.
- **Plan A (P2P/CRDT sync) is rejected.** Real-time sync from a static page needs a
  signaling/rendezvous service (WebRTC) or a third-party relay — that either
  violates the no-backend constraint ([SPEC-001]) or outsources it to
  infrastructure we don't control, with fragile failure modes (NAT traversal,
  both devices online simultaneously). The complexity is disproportionate to the
  actual need, which is occasionally moving a routine between two devices.
- **File export/import is deferred, not chosen.** It solves the same one-shot
  problem with more friction on mobile (file pickers, messenger attachment
  handling). It may return later as a backup/bulk-export complement, but it is out
  of scope for TK-021.

Additional detail informing TK-021's design: carrying the payload in the URL
**fragment** (`#…`) keeps it out of server logs entirely, which suits the static
GitHub Pages deployment.

## Notes
Origin: conductor backlog "Cross-Device" section and memory note on device sync.
