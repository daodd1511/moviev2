import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportError } from './reportError';

describe('reportError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the error with no context', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    reportError(error);

    expect(consoleSpy).toHaveBeenCalledWith('[reportError]', error);
  });

  it('logs structured context alongside the error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    reportError(error, { route: '/user/profile' });

    expect(consoleSpy).toHaveBeenCalledWith('[reportError]', error, { route: '/user/profile' });
  });

  it('redacts token, accessToken, password, and authorization from context', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    reportError(new Error('boom'), {
      token: 'secret-token',
      accessToken: 'secret-access-token',
      password: 'hunter2',
      authorization: 'Bearer secret',
      username: 'visible-user',
    });

    const [, , loggedContext] = consoleSpy.mock.calls[0];
    expect(loggedContext).toEqual({
      token: '[REDACTED]',
      accessToken: '[REDACTED]',
      password: '[REDACTED]',
      authorization: '[REDACTED]',
      username: 'visible-user',
    });
  });
});
