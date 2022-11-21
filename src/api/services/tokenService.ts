import { StorageService } from './storageService';

import { Token } from '@/models/auth/token.model';

const TOKEN_KEY = 'TOKENS';
export namespace TokenService {

  /** Get token from local storage. */
  export function get(): Token | null | string {
    return StorageService.get<Token>(TOKEN_KEY);
  }

  /**
   * Save token to local storage.
   * @param token Token received from server.
   */
  export function save(token: Token | string): void {
    return StorageService.set(TOKEN_KEY, token);
  }

  /** Destroy token from local storage. */
  export function destroy(): void {
    return StorageService.remove(TOKEN_KEY);
  }

  /** Check whether the storage have token or not. */
  export function has(): boolean {
    return get() !== null;
  }
}
