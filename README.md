# AtlasEduIntelligence

Atlas — an AI-powered ethical learning platform ("Atlas, powered by ElleAi / The
Ethical Intelligence Project").

## Layout

```
public/                 Static UI (served by the Atlas Edu worker)
  index.html            The full marketing site — dropped in exactly as designed
  atlas-emblem.png      Primary brand illustration (nav / hero / footer / spinning-globe)
src/
  index.ts              Worker entry — serves public/ + the /api education routes
  auth.ts               The token door (bearer -> learnerId over AUTH_TOKENS KV)
  router.ts             Tool scoping — toolAllowed(scope, name)
  course-source.ts      Local Fetcher serving the bundled courses to the engine
  education/            AI Engineering course — engine, tool surface, course content
    courses/*.json      The AI Engineer Stack curriculum (12 months, 5 tracks)
  md-modules.d.ts       Text-module typing for the bundled FACILITATOR.md import
wrangler.toml           Worker config (assets, D1, KV, nodejs_compat, *.md rule)
docs/
  design-handoff.md         Design handoff notes: tokens, sections, interactions
  education-integration.md  How src/education/ is wired into the worker
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

The Atlas Edu worker (`src/index.ts`) is a Cloudflare Worker with two jobs:

1. **Serve the marketing site.** Anything that isn't an `/api` path is served
   from `public/` through the `[assets]` binding.
2. **Serve the education API.** The six education tools are exposed under
   `/api`, behind the token door (`src/auth.ts`) and the tool gate
   (`src/router.ts`). Course data is fed to the (unmodified) education runtime
   from the bundled JSON via a local Fetcher (`src/course-source.ts`), so no
   separate course-database worker is needed.

### API

| Method & path | Scope | Purpose |
| --- | --- | --- |
| `GET /api/courses` | public | Course catalog (id + title) |
| `POST /api/admin/enroll-token` | admin | Mint a learner bearer token (`{learner, ttlDays?}`), rate-limited per IP |
| `POST /api/admin/revoke-token` | admin | Revoke a learner bearer token immediately (`{token}`) |
| `POST /api/edu/enroll` | member | Enroll (`{course?}`, defaults to `ai-engineer-stack`) |
| `POST /api/edu/log` | member | Log a session (`{unit, minutes, evidence?, note?, blocker?}`) |
| `POST /api/edu/seal` | member | Seal a three-tier reading (`{kind, unit?, phase?, tier1, tier2, tier3}`) |
| `POST /api/edu/complete` | member | Request unit completion (`{unit}`) — the gate decides |
| `GET /api/edu/brief` | member | The session brief + facilitator stance |
| `GET /api/edu/status` | member | Progress, corpus/chain state, openings (`?phase=`) |

Identity comes only from the presented bearer token — a learner can act only on
their own state; there is no learner argument to spoof.

### Setup & run

```sh
npm install
wrangler d1 create atlas-edu           # paste database_id into wrangler.toml
wrangler kv namespace create AUTH_TOKENS # paste id into wrangler.toml
wrangler secret put ADMIN_SECRET        # (locally: copy .dev.vars.example -> .dev.vars)

npm run typecheck   # tsc --noEmit
npm test            # vitest — the education engine + scope tests
npm run dev         # wrangler dev
npm run deploy      # wrangler deploy
```

Mint a learner token, then call the API:

```sh
curl -sX POST localhost:8787/api/admin/enroll-token \
  -H "Authorization: Bearer $ADMIN_SECRET" -d '{"learner":"alice"}'
# -> {"learner":"alice","token":"…"}
curl -sX POST localhost:8787/api/edu/enroll -H "Authorization: Bearer <token>" -d '{}'
```
