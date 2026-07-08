---
id: SPEC-001
title: Product vision & constraints
status: implemented
links: [SPEC-005, SPEC-006, SPEC-012]
---

# Product vision & constraints

Done-At Timer converts task durations into **wall-clock arrival times**. Instead of
"35 minutes remaining", the user sees "you will be done at 08:15" — a GPS-style ETA
for everyday routines.

- **Problem:** lateness caused by time blindness — difficulty feeling the cumulative
  effect of a sequence of tasks.
- **Primary audience:** people with time blindness; secondary: anyone running routine
  task sequences (morning routine, cooking, getting ready).
- **Core promise:** at any moment the app answers "if I keep going right now, when am
  I free?" ([SPEC-005]). The answer is always visible ([SPEC-006]).
- **Tone:** positive coaching, not alarm. Colors and copy avoid punishing the user for
  running late (e.g. soft amber for overtime, not red).
- **Focus over discoverability:** the main screen holds only the tasks and the
  arrival time. Everything secondary (routines, preferences, install) lives in the
  Control Center ([SPEC-012]) and never demands attention on the main screen — no
  banners, badges or unprompted prompts. This deliberately trades discoverability
  for calm, and future UI decisions follow the same rule.

## Hard constraints

- **No backend.** The app is a static site on GitHub Pages. Every feature must work
  with client-side code and client-side storage only. Features that would require a
  server (accounts, push-from-server, server sync) are out of scope by design —
  the zero-ops, zero-cost property is part of the product.
- Fully functional offline after first visit ([SPEC-015]).

## Log

- Seeded from code + conductor archive (2026-07-02)
- TK-004: added the focus-over-discoverability principle, stated by the unified
  sidebar track but missing here (2026-07-02)
