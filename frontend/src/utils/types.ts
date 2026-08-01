// Create a new type by picking only the keys with V type from T
export type OnlyKeyWithType<T, V> = keyof {
  [K in keyof T as NonNullable<T[K]> extends V ? K : never]: T[K];
};

export const isIterable = (obj: any): obj is Iterable<any> =>
  obj != null && typeof obj[Symbol.iterator] === 'function';
