import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  public get length(): number {
    return this.store.size;
  }

  public clear(): void {
    this.store.clear();
  }

  public getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  public key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

// Running this project's Node-environment API tests alongside these jsdom tests in the
// same run corrupts jsdom's real window.localStorage into a non-functional stub (Node
// 22's built-in localStorage, printed as "--localstorage-file was provided without a
// valid path", appears to hijack it process-wide). Force a working implementation rather
// than depend on whichever one wins the race.
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  localStorage.clear();
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
