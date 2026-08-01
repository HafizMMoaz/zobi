import { analyzeCurrencyInData } from '../../src/currency-format/utils';

test('analyzeCurrencyInData returns currency code for single currency', () => {
  const data = [
    { currency_code: 'USD', value: 100 },
    { currency_code: 'usd', value: 200 },
  ];
  expect(analyzeCurrencyInData(data, 'currency_code')).toBe('USD');
});

test('analyzeCurrencyInData returns null for mixed or invalid data', () => {
  expect(analyzeCurrencyInData([], 'currency_code')).toBeNull();
  expect(analyzeCurrencyInData([{ c: 'USD' }], undefined)).toBeNull();
  expect(analyzeCurrencyInData([{ c: 'USD' }, { c: 'EUR' }], 'c')).toBeNull();
});
