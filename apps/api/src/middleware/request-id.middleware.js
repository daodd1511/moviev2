import { randomUUID } from 'node:crypto';

// Syntactically safe: bounded length, no header-injection or path characters.
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

/** Accepts a safe incoming `x-request-id`, otherwise generates a UUID. Stores it on
 * `req.id`, echoes it in the response header, and makes it available to the logger and
 * error responses. */
export const requestId = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
};
