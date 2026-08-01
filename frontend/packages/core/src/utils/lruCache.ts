
class LRUCache<T> {
  private cache: Map<string, T>;

  readonly capacity: number;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error('The capacity in LRU must be greater than 0.');
    }
    this.capacity = capacity;
    this.cache = new Map<string, T>();
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public get(key: string): T | undefined {
    // Prevent runtime errors
    if (typeof key !== 'string') {
      throw new TypeError('The LRUCache key must be string.');
    }

    if (this.cache.has(key)) {
      const tmp = this.cache.get(key) as T;
      this.cache.delete(key);
      this.cache.set(key, tmp);
      return tmp;
    }
    return undefined;
  }

  public set(key: string, value: T) {
    // Prevent runtime errors
    if (typeof key !== 'string') {
      throw new TypeError('The LRUCache key must be string.');
    }
    if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }

  public clear() {
    this.cache.clear();
  }

  public get size() {
    return this.cache.size;
  }

  public values(): T[] {
    return [...this.cache.values()];
  }
}

export function lruCache<T>(capacity = 100) {
  return new LRUCache<T>(capacity);
}
