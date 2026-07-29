import pino from 'pino';
import pinoHttp from 'pino-http';

// Sensitive fields at any depth, plus common Express request locations.
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  '*.password',
  '*.token',
  '*.accessToken',
  '*.resetToken',
  '*.verificationToken',
];

export const logger = pino({
  redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
});

/** Builds request-logging middleware bound to the given logger, keyed by the request ID
 * already assigned by `request-id.middleware.js`. */
export const createHttpLogger = (boundLogger = logger) =>
  pinoHttp({
    logger: boundLogger,
    genReqId: req => req.id,
  });
