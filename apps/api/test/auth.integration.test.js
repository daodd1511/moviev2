import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { buildUserInput, createUser } from './helpers/factories.js';

let ipCounter = 0;
// Each test uses a distinct client IP so the shared auth-rate-limit bucket (keyed by
// req.ip) doesn't trip on unrelated requests within this file; the rate-limit test below
// deliberately reuses one IP to trigger it.
const nextIp = () => {
  ipCounter += 1;
  return `10.0.0.${ipCounter}`;
};

describe('POST /api/auth/register', () => {
  it('registers a user and returns only the public DTO', async () => {
    const app = createApp();
    const input = buildUserInput();

    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Forwarded-For', nextIp())
      .send(input);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ username: input.username, email: input.email });
    expect(res.body.password).toBeUndefined();
    expect(res.body.id).toEqual(expect.any(String));
  });

  it('rejects invalid input with a validation_error envelope', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Forwarded-For', nextIp())
      .send({ username: 'ab', email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('rejects unknown fields, including a spoofed id', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Forwarded-For', nextIp())
      .send({ ...buildUserInput(), id: 'attacker-controlled' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('rejects a duplicate username', async () => {
    const app = createApp();
    const { user } = await createUser();

    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Forwarded-For', nextIp())
      .send(buildUserInput({ username: user.username }));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('username_taken');
  });

  it('rejects a duplicate email', async () => {
    const app = createApp();
    const { user } = await createUser();

    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Forwarded-For', nextIp())
      .send(buildUserInput({ email: user.email }));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('email_taken');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const app = createApp();
    const input = buildUserInput();
    await request(app).post('/api/auth/register').set('X-Forwarded-For', nextIp()).send(input);

    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', nextIp())
      .send({ username: input.username, password: input.password });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: expect.any(String), accessToken: expect.any(String) });
  });

  it('rejects an unknown username with the generic invalid_credentials error', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', nextIp())
      .send({ username: 'no-such-user', password: 'whatever123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('invalid_credentials');
  });

  it('rejects a wrong password with the same generic error, not a distinct one', async () => {
    const app = createApp();
    const { user } = await createUser();

    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', nextIp())
      .send({ username: user.username, password: 'definitely-wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('invalid_credentials');
  });
});

describe('auth rate limiting', () => {
  it('returns 429 after 10 requests from the same client IP', async () => {
    const app = createApp();
    const ip = nextIp();
    const credentials = { username: 'nobody', password: 'whatever123' };

    for (let i = 0; i < 10; i += 1) {
      await request(app).post('/api/auth/login').set('X-Forwarded-For', ip).send(credentials);
    }

    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', ip)
      .send(credentials);

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('rate_limited');
  });
});
