const stableKey = value => JSON.stringify(value, Object.keys(value).sort());

export class CatalogCache {
  constructor({ ttlMs = 60_000, maxEntries = 500, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.now = now;
    this.entries = new Map();
  }

  get(input) {
    const key = stableKey(input);
    const entry = this.entries.get(key);
    if (entry === undefined) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  set(input, value) {
    const key = stableKey(input);
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
    while (this.entries.size > this.maxEntries)
      this.entries.delete(this.entries.keys().next().value);
    return value;
  }
}
