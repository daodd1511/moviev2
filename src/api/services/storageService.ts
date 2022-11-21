export namespace StorageService {

  /**
   * Set data to localStorage.
   * @param key Key to store.
   * @param value Value to store.
   */
  export function set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Get data from localStorage.
   * @param key Store key.
   */
  export function get<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (value === null || value === '') {
      return null;
    }
    return JSON.parse(value) as T;
  }

  /**
   * Remove data from localStorage.
   * @param key Store key.
   */
  export function remove(key: string): void {
    localStorage.removeItem(key);
  }
}
