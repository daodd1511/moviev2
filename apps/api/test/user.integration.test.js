import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createUser } from './helpers/factories.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';

describe('GET /api/user/profile', () => {
  it('returns the public DTO for the authenticated user', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    const res = await request(app).get('/api/user/profile').set(bearerAuth(token));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: user._id.toString(), username: user.username });
    expect(res.body.password).toBeUndefined();
  });

  it('rejects a missing bearer token', async () => {
    const app = createApp();

    const res = await request(app).get('/api/user/profile');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('rejects a non-Bearer scheme', async () => {
    const app = createApp();

    const res = await request(app).get('/api/user/profile').set('Authorization', 'Basic abc123');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('rejects an empty bearer token', async () => {
    const app = createApp();

    const res = await request(app).get('/api/user/profile').set('Authorization', 'Bearer ');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('rejects a malformed token', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it('rejects an expired token', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user, { expiresIn: -10 });

    const res = await request(app).get('/api/user/profile').set(bearerAuth(token));

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });
});

describe('PUT /api/user/profile', () => {
  it('updates only the authenticated user, never another account', async () => {
    const app = createApp();
    const { user } = await createUser();
    const { user: otherUser } = await createUser();

    const res = await request(app)
      .put('/api/user/profile')
      .set(bearerAuth(signAccessToken(user)))
      .send({ first_name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body.id).toBe(user._id.toString());

    const otherRes = await request(app)
      .get('/api/user/profile')
      .set(bearerAuth(signAccessToken(otherUser)));
    expect(otherRes.body.firstName).not.toBe('Updated');
  });

  it('rejects password, username, or id in the update body', async () => {
    const app = createApp();
    const { user } = await createUser();

    const res = await request(app)
      .put('/api/user/profile')
      .set(bearerAuth(signAccessToken(user)))
      .send({ password: 'newpassword123', username: 'hijacked' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('requires authentication', async () => {
    const app = createApp();

    const res = await request(app).put('/api/user/profile').send({ first_name: 'Nope' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });
});
