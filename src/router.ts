// ============================================================
// ATLAS EDU — src/router.ts
//
// Tool scoping for the worker. `toolAllowed(scope, name)` is the single
// gate deciding which tools a caller's scope may invoke. The education
// tests (src/education/education.test.ts) assert the edu_* tools are
// member/full only — never public or hospitality — so this is the
// authority that check runs against.
// ============================================================

/**
 * Who is asking.
 * - `public`      — unauthenticated (marketing site, no learner state)
 * - `member`      — an enrolled learner, holding a valid bearer token
 * - `full`        — admin (the ADMIN_SECRET holder)
 * - `hospitality` — a non-learner scope carried over from the wider
 *                   platform; it never sees course tools
 */
export type Scope = 'public' | 'member' | 'full' | 'hospitality';

/** The six education tools, wired in src/education/index.ts. */
export const EDU_TOOLS = new Set<string>([
  'edu_enroll',
  'edu_brief',
  'edu_log',
  'edu_seal',
  'edu_complete',
  'edu_status',
]);

/** Does `scope` permit calling the tool `name`? */
export function toolAllowed(scope: Scope, name: string): boolean {
  if (scope === 'full') return true;
  if (scope === 'member') return EDU_TOOLS.has(name);
  // public and hospitality never touch a learner's course state.
  return false;
}
