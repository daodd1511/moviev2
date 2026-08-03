import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import { AppError } from '../errors/app-error.js';

const unauthorized = () =>
  new AppError({
    status: 401,
    code: 'unauthorized',
    message: 'Authentication is required.',
  });

/** Requires a well-formed, valid Bearer token. Every failure — missing header, wrong
 * scheme, empty token, expired/invalid signature — maps to the same 401 `unauthorized`
 * so the response never hints at which check failed. */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next(unauthorized());
    return;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(unauthorized());
    return;
  }

  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      next(unauthorized());
      return;
    }
    req.userId = decoded.id;
    next();
  });
};

/** Decodes a Bearer token into `req.userId` when present and valid, but never rejects
 * the request — used by public endpoints (e.g. social profiles) that personalize their
 * response for a signed-in viewer without requiring one. */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next();
    return;
  }

  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (!err) {
      req.userId = decoded.id;
    }
    next();
  });
};

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  const { username, email } = req.body;

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    next(
      new AppError({ status: 409, code: 'username_taken', message: 'Username is already in use.' }),
    );
    return;
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    next(new AppError({ status: 409, code: 'email_taken', message: 'Email is already in use.' }));
    return;
  }

  next();
};
