import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase, getDatabaseState } from '../src/config/db.config.js';
import { getTestMongoUri } from './setup.js';

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

describe('request ID', () => {
  it('generates a request ID and echoes it in the response header', async () => {
    const app = createApp();

    const res = await request(app).get('/health');

    expect(res.headers['x-request-id']).toEqual(expect.any(String));
    expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('propagates a syntactically safe incoming x-request-id', async () => {
    const app = createApp();

    const res = await request(app).get('/health').set('x-request-id', 'client-supplied-id-123');

    expect(res.headers['x-request-id']).toBe('client-supplied-id-123');
  });

  it('replaces an unsafe incoming x-request-id with a generated one', async () => {
    const app = createApp();

    const res = await request(app).get('/health').set('x-request-id', 'has spaces/and/slashes');

    expect(res.headers['x-request-id']).not.toBe('has spaces/and/slashes');
    expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
  });
});

describe('GET /ready', () => {
  it('reports 200 while MongoDB is connected', async () => {
    const app = createApp();

    const res = await request(app).get('/ready');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('reports 503 while MongoDB is disconnected', async () => {
    const app = createApp();
    await disconnectDatabase();

    try {
      const res = await request(app).get('/ready');
      expect(res.status).toBe(503);
      expect(res.body).toEqual({ status: 'unavailable' });
    } finally {
      await connectDatabase(getTestMongoUri());
    }
  });
});
