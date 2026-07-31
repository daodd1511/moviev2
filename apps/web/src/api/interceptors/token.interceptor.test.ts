import { AxiosError, AxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  shouldInterceptWithToken,
  tokenErrorInterceptor,
  tokenInterceptor,
} from './token.interceptor';

import { TokenService } from '../services/tokenService';

describe('shouldInterceptWithToken', () => {
  it('intercepts non-auth requests', () => {
    expect(shouldInterceptWithToken({ url: '/user/profile' })).toBe(true);
  });

  it('excludes auth requests', () => {
    expect(shouldInterceptWithToken({ url: 'auth/login' })).toBe(false);
    expect(shouldInterceptWithToken({ url: '/auth/register' })).toBe(false);
  });
});

describe('tokenInterceptor', () => {
  afterEach(() => {
    TokenService.destroy();
  });

  it('attaches a bearer token to non-auth requests when one exists', () => {
    TokenService.save('abc123');
    const config: AxiosRequestConfig = { url: '/user/profile', headers: {} };

    const result = tokenInterceptor(config);

    expect(result.headers?.Authorization).toBe('Bearer abc123');
  });

  it('leaves auth requests untouched even when a token is present', () => {
    TokenService.save('abc123');
    const config: AxiosRequestConfig = { url: 'auth/login', headers: {} };

    const result = tokenInterceptor(config);

    expect(result.headers?.Authorization).toBeUndefined();
  });

  it('leaves the request untouched when no token exists', () => {
    const config: AxiosRequestConfig = { url: '/user/profile', headers: {} };

    const result = tokenInterceptor(config);

    expect(result).toBe(config);
  });
});

describe('tokenErrorInterceptor', () => {
  beforeEach(() => {
    TokenService.save('abc123');
    window.location.hash = '';
  });

  afterEach(() => {
    TokenService.destroy();
    window.location.hash = '';
  });

  it('clears the token and redirects to login on a 401', async () => {
    window.location.hash = '#/user/profile';
    const redirectTo = vi.fn();
    const error = { response: { status: 401 } } as AxiosError;

    await expect(tokenErrorInterceptor(error, redirectTo)).rejects.toBe(error);

    expect(TokenService.get()).toBeNull();
    expect(redirectTo).toHaveBeenCalledOnce();
    const redirectUrl = new URL(redirectTo.mock.calls[0][0] as string);
    expect(redirectUrl.hash).toBe('#/auth/login?redirect=%2Fuser%2Fprofile');
  });

  it('does not redirect again when already on the login route', async () => {
    window.location.hash = '#/auth/login';
    const redirectTo = vi.fn();
    const error = { response: { status: 401 } } as AxiosError;

    await expect(tokenErrorInterceptor(error, redirectTo)).rejects.toBe(error);

    expect(redirectTo).not.toHaveBeenCalled();
  });

  it('passes non-401 errors through without side effects', async () => {
    const redirectTo = vi.fn();
    const error = { response: { status: 500 } } as AxiosError;

    await expect(tokenErrorInterceptor(error, redirectTo)).rejects.toBe(error);

    expect(TokenService.get()).not.toBeNull();
    expect(redirectTo).not.toHaveBeenCalled();
  });
});
