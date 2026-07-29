import type { HttpHandler } from 'msw';

/**
 * Baseline MSW request handlers shared by every web test. Individual test files add
 * scenario-specific handlers with `server.use(...)`, reset automatically after each test
 * by `apps/web/src/test/setup.ts`.
 */
export const handlers: HttpHandler[] = [];
