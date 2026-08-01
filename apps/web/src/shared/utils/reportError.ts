const REDACTED_KEYS = new Set(['token', 'accesstoken', 'password', 'authorization']);
const REDACTED_PLACEHOLDER = '[REDACTED]';

const redactContext = (context: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(context).map(([key, value]) =>
      REDACTED_KEYS.has(key.toLowerCase()) ? [key, REDACTED_PLACEHOLDER] : [key, value],
    ),
  );

/**
 * Structured error-reporting sink. Logs to the console today; call sites don't need to
 * change when this is later swapped for a vendor (Sentry, etc.).
 * @param error The caught error.
 * @param context Extra structured detail. Any `token`/`accessToken`/`password`/
 * `authorization` key is redacted before logging — never pass raw credentials expecting
 * them to reach a log untouched.
 */
export const reportError = (error: unknown, context?: Record<string, unknown>): void => {
  if (context === undefined) {
    console.error('[reportError]', error);
    return;
  }
  console.error('[reportError]', error, redactContext(context));
};
