import { AppError } from '../errors/app-error.js';

/**
 * Parses `req.params`/`req.query`/`req.body` against the given Zod schemas, replacing
 * each with its parsed (and thus trimmed/coerced) value. A schema validation failure is
 * forwarded to the error middleware as a 400 `validation_error` with the Zod issues as
 * `details`; any other thrown error is forwarded unchanged.
 */
export const validate =
  ({ params, query, body } = {}) =>
  (req, res, next) => {
    try {
      if (params) {
        req.params = params.parse(req.params);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      if (body) {
        req.body = body.parse(req.body);
      }
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        next(
          new AppError({
            status: 400,
            code: 'validation_error',
            message: 'The request failed validation.',
            details: err.issues,
            cause: err,
          }),
        );
        return;
      }
      next(err);
    }
  };
