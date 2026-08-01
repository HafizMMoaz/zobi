export default function roundDecimal(
  number: number,
  precision?: number,
): number {
  let roundedNumber: number;
  if (precision) {
    const p = 10 ** precision;
    roundedNumber = Math.round(number * p) / p;
  } else {
    roundedNumber = Math.round(number);
  }

  return roundedNumber;
}
