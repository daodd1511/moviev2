import { AppError } from '../errors/app-error.js';

export const notFoundHandler = (_req, _res, next) => {
  next(
    new AppError({
      status: 404,
      code: 'not_found',
      message: 'The requested resource was not found.',
    }),
  );
};

/**
 * Terminal error handler. Sends the stable envelope `{ error: { code, message,
 * requestId, details? } }`. Anything that isn't an AppError is logged with full detail
 * but reported to the client as an opaque `internal_error` — stacks, Mongo errors, JWT
 * errors, and submitted credentials never reach the response body.
 */
// The 4th param (unused, `_next`) is required for Express to treat this as error-handling middleware.
export const errorHandler = (err, req, res, _next) => {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : 'internal_error';
  const message = isAppError ? err.message : 'Something went wrong. Please try again later.';

  req.app.locals.logger?.error({ err, requestId: req.id }, message);

  res.status(status).json({
    error: {
      code,
      message,
      requestId: req.id,
      ...(isAppError && err.details ? { details: err.details } : {}),
    },
  });
};
