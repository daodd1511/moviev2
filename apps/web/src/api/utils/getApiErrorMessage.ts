import { isAxiosError } from 'axios';

/** The backend's stable error envelope (`specs/security-test-foundation/PLAN.md` →
 * "Standardize API errors"). */
export interface ApiErrorEnvelope {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly requestId: string;
    readonly details?: unknown;
  };
}

/**
 * Extracts the safe, user-facing message from the API's stable error envelope.
 * @param error Value caught from a failed request; may not be an Axios error at all.
 * @param fallback Message to use when `error` isn't a recognizable API error response.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ApiErrorEnvelope>(error) && error.response?.data.error.message !== undefined) {
    return error.response.data.error.message;
  }
  return fallback;
};
