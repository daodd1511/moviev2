import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabaseState } from '../src/config/db.config.js';

describe('createApp', () => {
  it('builds an app instance without connecting to a database', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});

describe('GET /health', () => {
  it('responds ok without requiring authentication or a database connection', async () => {
    const app = createApp();

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('disposable MongoDB lifecycle', () => {
  it('is connected for the duration of the test run via the shared setup file', () => {
    expect(getDatabaseState()).toBe(1);
  });
});
