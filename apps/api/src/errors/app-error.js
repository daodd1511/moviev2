/** An error carrying the HTTP status, stable machine code, and safe message the error
 * middleware sends verbatim to clients. Anything not an AppError is treated as internal
 * and never reaches the client with its original message or stack. */
export class AppError extends Error {
  constructor({ status, code, message, details, cause }) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    if (cause) {
      this.cause = cause;
    }
  }
}
