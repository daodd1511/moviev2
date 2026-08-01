import jwt from 'jsonwebtoken';

/** Signs a valid access token for the given user, matching AuthService.login's claims. */
export const signAccessToken = (user, { expiresIn = '1h' } = {}) =>
  jwt.sign({ id: user._id }, process.env.TOKEN_KEY, { expiresIn });

/** Builds an `Authorization: Bearer <token>` header object for supertest. */
export const bearerAuth = token => ({ Authorization: `Bearer ${token}` });
