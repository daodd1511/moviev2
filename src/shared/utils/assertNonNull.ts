/**
 * Check for null or undefined element.
 * @param val Optional type of value.
 * @param message Optional message to display.
 */
export function assertNonNull<T>(val: T, message?: string): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      message ?? 'Expected \'element\' to be defined',
    );
  }
}

/**
 * Check for null or undefined element with return value.
 * @param val Optional type of value.
 * @param message Optional message to display.
 */
export function assertNonNullWithReturn<T>(val: T, message?: string): NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      message ?? 'Expected \'element\' to be defined',
    );
  }
  return val;
}
