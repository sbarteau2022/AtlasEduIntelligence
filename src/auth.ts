// ============================================================
// ATLAS EDU — src/auth.ts
//
// The door. Every /api/edu/* request must resolve to an authenticated
// learner id before it reaches the education handlers — the education
// runtime is explicit that a learner can only ever touch their own
// state, so identity is never taken from a request-supplied argument,
// only from the token presented here.
//
// Tokens are opaque, random, and stored in the AUTH_TOKENS KV namespace
// as `token -> learnerId`. They are minted out of band by an admin
// holding ADMIN_SECRET (see mintToken / the /api/admin/enroll-token
// route in index.ts). This is real enforcement — a caller cannot reach
// a learner's state without a token that an admin issued for them —
// while leaving the choice of identity provider (who gets a token, and
// when) to the platform around this worker.
// ============================================================

import type { Scope } from './router';

export interface AuthEnv {
  AUTH_TOKENS: KVNamespace;
  ADMIN_SECRET?: string;
}

export interface Principal {
  learnerId: string;
  scope: Scope;
}

const KEY_PREFIX = 'edu:token:';

function bearer(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/** Length-safe, constant-time string comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

/**
 * Resolve the caller to a principal, or null if the token is missing or
 * unknown. The ADMIN_SECRET, presented as a bearer token, resolves to a
 * `full`-scope admin principal; any other valid token is a `member`.
 */
export async function authenticate(request: Request, env: AuthEnv): Promise<Principal | null> {
  const token = bearer(request);
  if (!token) return null;

  if (env.ADMIN_SECRET && timingSafeEqual(token, env.ADMIN_SECRET)) {
    return { learnerId: 'admin', scope: 'full' };
  }

  const learnerId = await env.AUTH_TOKENS.get(KEY_PREFIX + token);
  return learnerId ? { learnerId, scope: 'member' } : null;
}

/** Is this request the admin (ADMIN_SECRET bearer)? */
export function isAdmin(request: Request, env: AuthEnv): boolean {
  const token = bearer(request);
  return !!token && !!env.ADMIN_SECRET && timingSafeEqual(token, env.ADMIN_SECRET);
}

/** Mint and persist a fresh learner token. Admin-only (caller must gate). */
export async function mintToken(env: AuthEnv, learnerId: string): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  await env.AUTH_TOKENS.put(KEY_PREFIX + token, learnerId);
  return token;
}
