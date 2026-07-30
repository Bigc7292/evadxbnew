type Cached<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, Cached<any>>();
const DEFAULT_TTL = 60 * 1000;

export function createCacheKey(parts: unknown[]): string {
  return parts.map((part) => {
    if (part === undefined || part === null) return '';
    if (typeof part === 'string' || typeof part === 'number' || typeof part === 'boolean') {
      return String(part);
    }
    return JSON.stringify(part);
  }).join('::');
}

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}
