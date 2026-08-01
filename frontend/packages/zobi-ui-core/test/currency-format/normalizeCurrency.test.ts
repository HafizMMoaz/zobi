
import { normalizeCurrency } from '../../src/currency-format/CurrencyFormatter';

test('normalizeCurrency normalizes valid ISO 4217 codes', () => {
  expect(normalizeCurrency('USD')).toBe('USD');
  expect(normalizeCurrency('usd')).toBe('USD');
  expect(normalizeCurrency(' eur ')).toBe('EUR');
});

test('normalizeCurrency returns null for invalid input', () => {
  expect(normalizeCurrency(null)).toBe(null);
  expect(normalizeCurrency('')).toBe(null);
  expect(normalizeCurrency('$')).toBe(null);
  expect(normalizeCurrency('DOLLAR')).toBe(null);
  expect(normalizeCurrency('USDD')).toBe(null);
});
