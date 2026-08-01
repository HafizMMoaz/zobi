

export default function isDefined<T>(x: T): x is NonNullable<T> {
  return x !== null && x !== undefined;
}
