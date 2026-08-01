// ============================================================
// ATLAS EDU — src/index.ts
//
// The Atlas Edu worker. Two responsibilities:
//
//  1. Serve the static marketing site in public/ (index.html +
//     atlas-emblem.png) through the [assets] binding.
//  2. Expose the education engine (src/education/) as a small HTTP API
//     under /api, behind the token door (src/auth.ts) and the tool gate
//     (src/router.ts).
//
// The engine decides — signals, gates, and sealing are computed
// deterministically inside src/education/. This worker only carries
// requests to it: it authenticates the learner, checks the tool is in
// scope, and returns the handler's observation string as JSON.
// ============================================================

import {
  eduEnroll, eduLog, eduSeal, eduBrief, eduComplete, eduStatus,
  type EduEnv,
} from './education/index';
import { authenticate, isAdmin, mintToken } from './auth';
import { toolAllowed, type Scope } from './router';
import { localCourseFetcher } from './course-source';

export interface Env {
  DB: D1Database;
  AUTH_TOKENS: KVNamespace;
  ASSETS: Fetcher;
  ADMIN_SECRET?: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

// Course data comes from the bundled JSON via a local Fetcher, so the
// vendored education runtime runs unmodified.
const eduEnv = (env: Env): EduEnv => ({ DB: env.DB, CUSTOMCOURSEBUILDER: localCourseFetcher() });

async function readArgs(request: Request): Promise<Record<string, unknown>> {
  if (request.method !== 'POST') return {};
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// tool name → { method, run }. `run` gets the resolved learnerId, so a
// caller can only ever act on their own state.
type EduRun = (env: Env, learnerId: string, args: Record<string, unknown>) => Promise<string>;
const EDU_ROUTES: Record<string, { tool: string; method: 'GET' | 'POST'; run: EduRun }> = {
  enroll:   { tool: 'edu_enroll',   method: 'POST', run: (e, id, a) => eduEnroll(eduEnv(e), id, a) },
  log:      { tool: 'edu_log',      method: 'POST', run: (e, id, a) => eduLog(eduEnv(e), id, a) },
  seal:     { tool: 'edu_seal',     method: 'POST', run: (e, id, a) => eduSeal(eduEnv(e), id, a) },
  complete: { tool: 'edu_complete', method: 'POST', run: (e, id, a) => eduComplete(eduEnv(e), id, a) },
  brief:    { tool: 'edu_brief',    method: 'GET',  run: (e, id) => eduBrief(eduEnv(e), id) },
  status:   { tool: 'edu_status',   method: 'GET',  run: (e, id, a) => eduStatus(eduEnv(e), id, a) },
};

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.slice('/api/'.length);

  // ── public course catalog (marketing-facing) ──
  if (path === 'courses' && request.method === 'GET') {
    const res = await localCourseFetcher().fetch('https://local/courses');
    return json(await res.json());
  }

  // ── admin: mint a learner token (ADMIN_SECRET bearer only) ──
  if (path === 'admin/enroll-token') {
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
    if (!isAdmin(request, env)) return json({ error: 'forbidden' }, 403);
    const args = await readArgs(request);
    const learner = String(args.learner || '').trim();
    if (!learner) return json({ error: 'learner required' }, 400);
    const token = await mintToken(env, learner);
    return json({ learner, token });
  }

  // ── education tools ──
  const edu = path.match(/^edu\/(\w+)$/);
  if (edu) {
    const route = EDU_ROUTES[edu[1]];
    if (!route) return json({ error: `unknown edu endpoint "${edu[1]}"` }, 404);
    if (request.method !== route.method) return json({ error: 'method not allowed' }, 405);

    const principal = await authenticate(request, env);
    if (!principal) return json({ error: 'unauthorized' }, 401);
    if (!toolAllowed(principal.scope as Scope, route.tool)) return json({ error: 'forbidden' }, 403);

    const args = request.method === 'POST'
      ? await readArgs(request)
      : Object.fromEntries(url.searchParams.entries());
    try {
      const result = await route.run(env, principal.learnerId, args);
      return json({ result });
    } catch (e) {
      return json({ error: (e as Error).message }, 500);
    }
  }

  return json({ error: 'not found' }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return handleApi(request, env, url);
    }
    // Everything else is the static marketing site.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
