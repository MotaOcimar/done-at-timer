# Workflow — Tickets & Specs

This directory is the project's planning and documentation system. It is designed to be
usable by a human working alone, by an AI agent, or both together. It replaces the
`conductor/` system, which is now a **frozen historical archive** (never edit it; consult
it only for archaeology on _when/how_ a decision evolved).

## The two record types

|               | Tickets (`tickets/`)                   | Specs (`specs/`)                                 |
| ------------- | -------------------------------------- | ------------------------------------------------ |
| **Describe**  | A _change_ (delta)                     | The _intended current state_                     |
| **Analogy**   | Jira issue / git commit                | Living documentation / working tree              |
| **Lifecycle** | Immutable after `done` (except status) | Edited forever, always up to date                |
| **Answers**   | "What are we doing and why now?"       | "How is the product _supposed_ to behave today?" |

Specs are the safe harbor for the question "is this behavior expected?". If observed
behavior diverges from a spec, that divergence is by definition a **bug** — open a
ticket citing the spec it violates; never silently bend the spec to match broken code
(changing the _intent_ is legitimate, but happens through a ticket, decided on purpose).

To understand how the app should behave, read specs — never reconstruct it from ticket
history. To understand why it got that way, follow the ticket references in the spec's log.

## The one invariant that keeps this system honest

> **A ticket is not `done` until every spec it affects has been updated.**

Every ticket lists the specs it touches in its `specs:` frontmatter field. Closing a
ticket without updating those specs is the failure mode that makes documentation lie —
if you do only one thing right in this system, do this.

## IDs and files

- Specs: `SPEC-NNN` — file `specs/SPEC-NNN-short-slug.md`
- Tickets: `TK-NNN` — file `tickets/TK-NNN-short-slug.md`
- IDs are sequential and **never reused or renumbered**. Take the next free number
  from the INDEX. Slugs may be imperfect; IDs are the identity.
- Reference anything from anywhere by ID (e.g. "violates SPEC-004"). Links are
  **forward-only** in frontmatter; find backlinks with `grep -rn "SPEC-004" project/`.
  Do not maintain manual backlink lists.

## Spec rules

- **Atomicity criterion:** a spec is scoped correctly when a ticket that changes the
  behavior either invalidates/edits the note as a whole, or doesn't touch it at all.
  One behavior area per note — not one sentence, not the whole app.
- Specs describe **intended behavior**, in present tense, as testable statements.
- **Implementation-agnostic:** a spec must survive any refactor that preserves
  behavior. No variable/function/state names, no library mechanics — describe what a
  user (or a black-box test) can observe, plus its consequences. The only place code
  may be mentioned is the optional "Implementation pointers" section, restricted to
  file paths that help the reader find their way — it documents _where_, never _how_.
- `status:` is `implemented` or `planned` (agreed but not built). A **bug is not a spec
  status** — a bug is a ticket citing the spec it violates. If the spec matches the
  code but the behavior is wrong _by design_, fix the spec via a ticket.
- Known limitations that are _accepted current behavior_ belong in the spec (with a
  pointer to the ticket that will change them, if one exists).
- Each spec ends with a short `## Log` — one line per ticket that shaped it. This is
  the only place history lives inside a spec.

## Ticket rules

- `type:` `feature` | `bug` | `chore` | `idea`. Ideas are allowed to be vague; they
  must graduate (get acceptance criteria and a `specs:` list) before work starts.
- `status:` `open` | `in-progress` | `in-review` | `done` | `wontfix`. See
  **Acceptance gate** for when `in-review` is required.
- A ticket should fit in one sitting of review: context, acceptance criteria,
  affected specs.
- After a ticket is `done`, edit nothing but the `status` field. Corrections happen
  in new tickets.
- **Commits map to tickets:** every commit belongs to exactly one ticket — never mix
  changes from different tickets in a single commit. A ticket may span several commits
  (e.g. the initial implementation, then a follow-up commit for an adjustment surfaced
  during `in-review`). Name the ticket ID in each commit subject. When several tickets
  were worked together, split them at commit time by staging per ticket.
- **One commit per functionality, even within a ticket.** Prefer a separate commit for
  each discrete, self-contained change — in particular, every review refinement lands
  as its own commit — so history stays granular and each behavior change is traceable
  on its own line. Commit each refinement right after it is built and green, rather
  than batching several at the end (batching is what forces unrelated changes to
  interleave in the same files and become impossible to separate cleanly later). Group
  changes into one commit only when they genuinely interleave in the same files; when
  that happens, say so in the commit body.

## Planning & handoff

Non-trivial tickets go through an explicit **planning stage before any code**,
producing two sections inside the ticket file. They are distinct contents — thinking
vs. doing — and must not be blended:

- **`## Design` — the decisions.** Dilemmas surfaced and resolved (against specs, by
  ID), choices with their rationale, and an explicit out-of-scope list. If planning
  reveals that a spec must change, that's recorded here as a decision — not
  discovered mid-code by accident. Once implementation starts, this section is
  **settled**: changing a design decision means stopping and revising it here first,
  on purpose.
- **`## Plan` — the execution.** An ordered checklist of steps (grouped in phases if
  useful). Boxes are checked as steps complete — appending the commit hash to the
  line is encouraged. No rationale lives here; a plan step never introduces a
  decision that isn't in Design.

Rules:

- **Important decisions are made with the team, never solo.** Design, UX, UI, and
  product dilemmas — and important tradeoffs in general — are closed _with_ the
  user, not by whoever happens to be planning. Surface each dilemma as concrete
  options with a recommendation and its rationale, and let the user choose. Only
  details with a single obvious answer already settled by the codebase or an
  existing spec may be proposed directly — and even those are written into Design
  so they can be reviewed and vetoed.
- A ticket moves to `in-progress` only when Design has no open dilemmas and Plan
  exists. Trivial tickets (one-line fixes, chores) may skip both — use judgment;
  planning is proportional to the risk of the change, not a ritual.
- A **user-facing** ticket moves to `in-review` (not straight to `done`) once code,
  tests, and specs are complete, and reaches `done` only after manual acceptance on
  the running app — see **Acceptance gate**.
- While work is underway, the Plan checkboxes are the **single source of "where we
  are"**. If you stop mid-task, leave a one-line `> State:` note under the plan
  saying what's half-done or surprising.
- When the ticket is `done`, Design and Plan freeze with it — the historical record
  of _what was decided_ and _how it was carried out_.

**Resume protocol** (for a new agent or a cleared context): read `workflow.md`, then
`tickets/INDEX.md` to find the `in-progress` ticket, then that ticket — Design for
the settled decisions, Plan checkboxes and `State:` note for where to continue — and
the specs it cites. Recent `git log` fills in the rest. Decisions recorded in Design
are closed — do not reopen them without the user.

## Acceptance gate — user-facing tickets earn `done`, they are not just declared

A second honesty rule, parallel to the spec invariant:

> **A user-facing ticket is not `done` until it has been manually accepted on the
> running app** — by the user, or another team member acting as reviewer.

- **Status flow:** `in-progress` → **`in-review`** → `done`. When implementation is
  complete (code + tests + specs), the ticket moves to `in-review`, not straight to
  `done`; it reaches `done` only after acceptance is recorded.
- **Who & what:** the reviewer checks the ticket's Acceptance Criteria against the
  _actual running feature_ — "is this what we meant, and does it look/feel right?" —
  not just that tests pass. Tests prove behavior; the gate proves fit. Record the
  sign-off on the ticket under an `## Acceptance` line (who + date) before flipping
  to `done`.
- **Scope (proportional, not ritual):** the gate applies to tickets with
  **observable user-facing behavior** — `feature`/`bug` touching UI, UX, or anything
  a person can see or feel. Pure `chore`/`refactor`/internal-logic tickets with no
  observable surface (lint, prettier, comment translation, tick unification) skip
  `in-review` and may go `in-progress` → `done` on green tests alone. When unsure,
  gate it.
- **Implementer self-check before handoff:** before moving a user-facing ticket to
  `in-review`, the implementer drives the affected flow in the running app and
  confirms the changed states render correctly (a screenshot is ideal). The reviewer
  should be looking at something already sanity-checked, never a first render.
- **Log refinements as they land:** every feedback adjustment made while a ticket is
  `in-review` is recorded at the time it is applied, not batched at the end —
  appended to the ticket's Plan as a dated `Review refinement (user, YYYY-MM-DD)`
  line, and, when it changes spec'd behavior, written into the affected spec's body
  and its `## Log`. The Plan is the running record of what review surfaced and how it
  was resolved; pair it with the per-refinement commit above so the code change and
  its rationale are traceable together.
- **Why:** `done` is frozen (see ticket rules). Marking a feature `done` before a
  human has seen it forces every "actually, not quite" into a fresh correction
  ticket — the churn this rule exists to stop. Holding at `in-review` lets the
  original ticket absorb the refinement, then freeze once.

## Indexes

`specs/INDEX.md` and `tickets/INDEX.md` hold one line per item:
`ID — title (status)`. Update the index in the same commit that adds or renames a file.
The index is a table of contents, not a summary — content lives only in the files.

## Templates

### Spec

```markdown
---
id: SPEC-NNN
title: Short behavior-area name
status: implemented
links: [SPEC-XXX]
---

# Title

Present-tense statements of intended behavior.

## Known limitations

(optional — accepted behavior that a ticket may later change)

## Implementation pointers

(optional — file paths only, to orient the reader; may rot, verify before trusting)

## Log

- TK-NNN: what it changed here (YYYY-MM-DD)
```

### Ticket

```markdown
---
id: TK-NNN
title: Imperative summary of the change
type: feature
status: open
specs: [SPEC-XXX]
---

# Title

## Context

Why this, why now. Cite specs by ID.

## Acceptance criteria

- [ ] Observable outcomes, not implementation steps.

## Design

(required before in-progress, unless trivial — see "Planning & handoff")
Resolved dilemmas + decisions with rationale, citing specs by ID. Out of scope list.

## Plan

(required before in-progress, unless trivial)

- [ ] Ordered steps only — no rationale here. Checked = done (append commit hash).
- [ ] Unchecked = where to resume.

> State: (optional one-liner when stopping mid-work)

## Acceptance

(user-facing tickets only — who accepted it on the running app, and when. Required
before `done`; see "Acceptance gate". Omit for exempt chore/refactor tickets.)

## Notes

(optional, frozen with the ticket when done)
```

## Engineering rules (apply to every ticket's implementation)

- **TDD is mandatory**: Red → Green → Refactor. No production code without a failing
  test first.
- **SOLID**, especially Dependency Inversion when wrapping browser APIs
  (Notification, ServiceWorker, vibration…): always an abstraction layer so tests can
  mock the dependency. See `src/utils/notificationService.ts` for the pattern.
- **Code style:** follow `project/styleguides/` (TypeScript, HTML/CSS).
