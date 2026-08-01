import Cache, { caches } from './Cache';

export default class CacheStorage {
  open(key: string): Promise<Cache> {
    return new Promise(resolve => {
      resolve(new Cache(key));
    });
  }

  delete(key: string): Promise<boolean> {
    const wasPresent = key in caches;
    if (wasPresent) {
      delete caches[key];
    }
    return Promise.resolve(wasPresent);
  }
}
