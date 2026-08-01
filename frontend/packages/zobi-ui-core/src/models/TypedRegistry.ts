
/**
 * A Registry which serves as a typed key:value store for Zobi and for Plugins.
 *
 * Differences from the older Registry class:
 *
 * 1. The keys and values stored in this class are individually typed by TYPEMAP parameter.
 *    In the old Registry, all values are of the same type and keys are not enumerated.
 *    Though you can also use indexed or mapped types in a TYPEMAP.
 *
 * 2. This class does not have a separate async get and set methods or use loaders.
 *    Instead, TYPEMAP should specify async values and loaders explicitly when needed.
 *    The value can be anything! A string, a class, a function, an async function... anything!
 *
 * 3. This class does not implement Policies, that is a separate concern to be handled elsewhere.
 *
 *
 * Removing or altering types in a type map could be a potential breaking change, be careful!
 *
 * Listener methods have not been added because there isn't a use case yet.
 */
class TypedRegistry<TYPEMAP extends {}> {
  name = 'TypedRegistry';

  private records: TYPEMAP;

  constructor(initialRecords: TYPEMAP) {
    this.records = initialRecords;
  }

  get<K extends keyof TYPEMAP>(key: K): TYPEMAP[K] {
    // The type construction above means that when you call this function,
    // you get a really specific type back.
    return this.records[key];
  }

  set<K extends keyof TYPEMAP>(key: K, value: TYPEMAP[K]) {
    this.records[key] = value;
  }
}

export default TypedRegistry;
