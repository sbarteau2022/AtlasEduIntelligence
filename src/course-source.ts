// ============================================================
// ATLAS EDU — src/course-source.ts
//
// The vendored education runtime (src/education/index.ts) reads course
// data through a `CUSTOMCOURSEBUILDER` Fetcher rather than importing the
// JSON directly — in the Elle worker that binding points at a separate
// course-database Worker. Atlas Edu has no such sibling: the two bundled
// course files ARE the course content. So instead of standing up another
// Worker (or hand-editing the vendored file), we hand the education
// handlers a tiny in-process Fetcher that answers the same two routes it
// expects — GET /courses and GET /courses/:id — straight from the
// bundled JSON. index.ts stays byte-for-byte as synced.
// ============================================================

import aiEngineerStack from './education/courses/ai-engineer-stack.json';
import aiEngineerCurriculum from './education/courses/ai-engineer-curriculum.json';

interface CourseDoc {
  id: string;
  title: string;
  [key: string]: unknown;
}

const COURSES: Record<string, CourseDoc> = {
  'ai-engineer-stack': aiEngineerStack as unknown as CourseDoc,
  'ai-engineer-curriculum': aiEngineerCurriculum as unknown as CourseDoc,
};

function urlOf(input: RequestInfo | URL): URL {
  if (input instanceof URL) return input;
  if (typeof input === 'string') return new URL(input);
  return new URL(input.url);
}

/**
 * A Fetcher over the bundled courses, shaped exactly like the
 * customcoursebuilder service binding the education runtime expects.
 * The hostname is irrelevant — only the pathname is routed.
 */
export function localCourseFetcher(): Fetcher {
  const fetcher = {
    async fetch(input: RequestInfo | URL): Promise<Response> {
      const { pathname } = urlOf(input);
      const one = pathname.match(/^\/courses\/(.+)$/);
      if (one) {
        const course = COURSES[decodeURIComponent(one[1])];
        return course
          ? Response.json(course)
          : new Response('course not found', { status: 404 });
      }
      if (pathname === '/courses') {
        return Response.json(
          Object.values(COURSES).map(({ id, title }) => ({ id, title })),
        );
      }
      return new Response('not found', { status: 404 });
    },
  };
  return fetcher as unknown as Fetcher;
}
