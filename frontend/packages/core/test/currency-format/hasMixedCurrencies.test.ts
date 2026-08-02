import { hasMixedCurrencies } from '../../src/currency-format/CurrencyFormatter';

test('hasMixedCurrencies detects mixed vs single currency', () => {
  expect(hasMixedCurrencies(['USD', 'EUR'])).toBe(true);
  expect(hasMixedCurrencies(['USD', 'usd'])).toBe(false);
  expect(hasMixedCurrencies(['USD'])).toBe(false);
  expect(hasMixedCurrencies([])).toBe(false);
});

test('hasMixedCurrencies ignores null values', () => {
  expect(hasMixedCurrencies(['USD', null, 'USD'])).toBe(false);
  expect(hasMixedCurrencies(['USD', null, 'EUR'])).toBe(true);
});
