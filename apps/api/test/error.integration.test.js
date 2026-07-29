import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { AppError } from '../src/errors/app-error.js';
import { errorHandler, notFoundHandler } from '../src/middleware/error.middleware.js';
import { requestId } from '../src/middleware/request-id.middleware.js';

describe('not-found handling', () => {
  it('returns the stable error envelope for an unknown route', async () => {
    const app = createApp();

    const res = await request(app).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'not_found' });
    expect(res.body.error.requestId).toEqual(expect.any(String));
  });
});

// Exercises errorHandler/notFoundHandler directly against a minimal app: none of the
// current routes throw synchronously, and their controllers aren't converted to the
// AppError/next(error) contract until later phases.
const buildErrorTestApp = () => {
  const app = express();
  app.locals.logger = { error: () => {} };
  app.use(requestId);

  app.get('/boom', () => {
    throw new Error('leaked internal detail: password=hunter2');
  });

  app.get('/known', (req, res, next) => {
    next(
      new AppError({
        status: 400,
        code: 'bad_request',
        message: 'Bad input.',
        details: [{ path: 'name', message: 'Required' }],
      }),
    );
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('errorHandler', () => {
  it('hides internal error details behind a safe message and code', async () => {
    const app = buildErrorTestApp();

    const res = await request(app).get('/boom');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('internal_error');
    expect(res.body.error.message).not.toMatch(/hunter2/);
    expect(res.body.error.requestId).toEqual(expect.any(String));
  });

  it('surfaces an AppError status, code, message, and details verbatim', async () => {
    const app = buildErrorTestApp();

    const res = await request(app).get('/known');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({
      code: 'bad_request',
      message: 'Bad input.',
      details: [{ path: 'name', message: 'Required' }],
    });
  });
});
