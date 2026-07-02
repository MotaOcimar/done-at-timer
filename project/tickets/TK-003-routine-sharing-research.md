---
id: TK-003
title: Routine sharing/sync between devices — viability research
type: idea
status: open
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
- [ ] Written recommendation (in this ticket) choosing Plan A or B with rationale.
- [ ] Follow-up feature ticket created with concrete acceptance criteria and the
      spec changes it will require (at minimum SPEC-011, SPEC-013).

## Notes
Origin: conductor backlog "Cross-Device" section and memory note on device sync.
