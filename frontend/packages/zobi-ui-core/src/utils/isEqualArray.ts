export default function isEqualArray<T extends unknown[] | undefined | null>(
  arrA: T,
  arrB: T,
) {
  return (
    arrA === arrB ||
    (!arrA && !arrB) ||
    !!(
      arrA &&
      arrB &&
      arrA.length === arrB.length &&
      arrA.every((x, i) => x === arrB[i])
    )
  );
}
