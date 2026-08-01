export const caches: Record<string, Record<string, Response>> = {};

export default class Cache {
  cache: Record<string, Response>;

  constructor(key: string) {
    caches[key] = caches[key] || {};
    this.cache = caches[key];
  }

  match(url: string): Promise<Response | undefined> {
    return new Promise(resolve => resolve(this.cache[url]));
  }

  delete(url: string): Promise<boolean> {
    delete this.cache[url];
    return new Promise(resolve => resolve(true));
  }

  put(url: string, response: Response): Promise<void> {
    this.cache[url] = response;
    return Promise.resolve();
  }
}
