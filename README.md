# AtlasEduIntelligence

Atlas — an AI-powered ethical learning platform ("Atlas, powered by ElleAi / The
Ethical Intelligence Project").

## Layout

```
public/                 Static UI (served by the Atlas Edu worker)
  index.html            The full marketing site — dropped in exactly as designed
  atlas-emblem.png      Primary brand illustration (nav / hero / footer / spinning-globe)
docs/
  design-handoff.md     Design handoff notes: tokens, sections, interactions
```

## UI

`public/index.html` is the complete Atlas marketing page — a single scrolling
page with a theme-shifting nav, cosmic dark hero, cream light body sections, a
dark stats band, and footer. It's self-contained (styles, scroll behavior, and
the spinning-globe effect are all inline) and references only
`atlas-emblem.png`. See `docs/design-handoff.md` for the full spec.

## Worker

The Atlas Edu worker (to be built) serves the static UI in `public/`.
