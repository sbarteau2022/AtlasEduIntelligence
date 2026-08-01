# AtlasEduIntelligence

Atlas — an AI-powered ethical learning platform ("Atlas, powered by ElleAi / The
Ethical Intelligence Project").

## Layout

```
public/                 Static UI (served by the Atlas Edu worker)
  index.html            The full marketing site — dropped in exactly as designed
  atlas-emblem.png      Primary brand illustration (nav / hero / footer / spinning-globe)
src/education/          AI Engineering course — engine, tool surface, course content
  courses/*.json        The AI Engineer Stack curriculum (12 months, 5 tracks)
src/md-modules.d.ts     Text-module typing for the bundled FACILITATOR.md import
docs/
  design-handoff.md         Design handoff notes: tokens, sections, interactions
  education-integration.md  What the worker must wire for src/education/
```

## UI

`public/index.html` is the complete Atlas marketing page — a single scrolling
page with a theme-shifting nav, cosmic dark hero, cream light body sections, a
dark stats band, and footer. It's self-contained (styles, scroll behavior, and
the spinning-globe effect are all inline) and references only
`atlas-emblem.png`. See `docs/design-handoff.md` for the full spec.

## Education

`src/education/` is the AI Engineering course, brought over from the Elle worker
as-is: the deterministic course engine (types, state, signals, gate, sealed
readings, session brief), the `edu_*` worker tool surface over D1, the binding
facilitator stance, and the course content itself — the **AI Engineer Stack**
(12 months across 5 parallel tracks: coding, AI/ML, data engineering, business,
law). The engine decides (signals, gates, sealing computed deterministically);
the model speaks (it delivers the moves but can't override the gate). See
`docs/education-integration.md` for exactly what the worker must provide (D1
binding, course data source, `nodejs_compat`, the `*.md` Text rule, and the six
`edu_*` router tools).

## Worker

The Atlas Edu worker (to be built) serves the static UI in `public/` and wires
up the education engine in `src/education/`.
