# Education engine — integration notes

The AI Engineering course lives in `src/education/`, brought over from the Elle
worker exactly as-is. This is the deterministic **CustomCourseBuilder runtime**
plus its worker tool surface and the course content. The Atlas Edu worker wires
it up; nothing here was rewritten.

## What's in `src/education/`

| File | Role |
| --- | --- |
| `course-types.ts` | Course/unit/pillar type definitions |
| `state.ts` | Learner state shape, pillar keys, `newLearnerState()` |
| `signals.ts` | Deterministic signal detection (evidence fraction, etc.) |
| `engine.ts` | The gate: `availableUnits`, `recordSession`, `completeUnit`, `phaseReview`, `unitById` |
| `seal.ts` | Tamper-evident sealed-reading hash chain (`sealReading`, `verifyChain`) |
| `brief.ts` | `sessionBrief()` — the per-session brief the model delivers |
| `index.ts` | Worker tool surface + D1-backed learner state |
| `FACILITATOR.md` | The binding facilitator stance, bundled into `edu_brief` |
| `courses/ai-engineer-stack.json` | **The AI Engineer Stack course** (12 months, 5 tracks) |
| `courses/ai-engineer-curriculum.json` | The expanded unit-by-unit curriculum |
| `education.test.ts` | Engine tests + a router-gating check (see below) |

Division of labor (from `index.ts`): the **engine decides** — signals, moves,
gates, and sealing are computed deterministically from logged state and named
thresholds. The **model speaks** — it delivers the moves in conversation but
cannot override the gate or ghost-write a learner's sealed readings.

## What the worker must provide

1. **D1 binding `DB`.** `ensureEduSchema()` (called lazily by every handler)
   creates an `edu_state` table — one JSON-document row per learner, keyed by
   the authenticated `userId`. The sealed-reading hash chain inside the document
   is what makes each row tamper-evident, so no wider schema is needed.

2. **Course data source.** `index.ts` reads courses live through a
   `CUSTOMCOURSEBUILDER` service binding (`fetchCourse` / `fetchCourseIds`),
   *not* from the JSON files — in the Elle worker those JSON files are only
   pinned test fixtures. For the Atlas Edu worker, either:
   - bind a `CUSTOMCOURSEBUILDER` service that serves `GET /courses` and
     `GET /courses/:id`, **or**
   - adapt `fetchCourse` / `fetchCourseIds` to read the bundled
     `courses/*.json` directly (they are the real course content).

   Default course id: `ai-engineer-stack`.

3. **`nodejs_compat` compatibility flag.** `seal.ts` imports `createHash` from
   `node:crypto` for the reading hash chain.

4. **Text-module bundling for `FACILITATOR.md`.** `index.ts` does
   `import facilitatorStance from './FACILITATOR.md'`. In `wrangler.toml`:

   ```toml
   [[rules]]
   type = "Text"
   globs = ["**/*.md"]
   ```

   The matching type declaration (`declare module '*.md'`) is already included
   at `src/md-modules.d.ts`.

5. **Router wiring.** Expose the six tools, each called as
   `handler(env, userId, args)` where `userId` is the authenticated caller from
   the door (a learner can only ever touch their own state — there is no learner
   argument to spoof):

   | Tool | Handler |
   | --- | --- |
   | `edu_enroll` | `eduEnroll(env, userId, args)` |
   | `edu_log` | `eduLog(env, userId, args)` |
   | `edu_seal` | `eduSeal(env, userId, args)` |
   | `edu_brief` | `eduBrief(env, userId)` |
   | `edu_complete` | `eduComplete(env, userId, args)` |
   | `edu_status` | `eduStatus(env, userId, args)` |

   Every handler returns a `string` (the router's observation contract).
   `EduEnv` is `{ DB: D1Database; CUSTOMCOURSEBUILDER?: Fetcher }`.

6. **TypeScript config.** The module imports with `.ts` extensions and reads
   JSON, so the worker's `tsconfig.json` needs
   `"allowImportingTsExtensions": true` and `"resolveJsonModule": true`, with
   `@cloudflare/workers-types` and `node` in `types` (for `D1Database`,
   `Fetcher`, and `node:crypto`).

## Note on `education.test.ts`

The engine tests are self-contained (they run the vendored engine against the
bundled course JSON). One block also asserts the edu tools are member-scoped and
imports `toolAllowed` from `../router`:

```ts
import { toolAllowed } from '../router';
// edu_* tools are allowed for 'member' and 'full', denied for 'public'/'hospitality'
```

That coupling is intentional — it's the worker's own gating. It passes once the
Atlas Edu worker's `src/router.ts` exports `toolAllowed(scope, name)` and gates
the six `edu_*` tools to the `member` and `full` scopes.
