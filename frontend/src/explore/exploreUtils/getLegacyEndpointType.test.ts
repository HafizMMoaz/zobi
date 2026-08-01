import { getLegacyEndpointType } from '.';

const createParams = () => ({
  resultType: 'resultType',
  resultFormat: 'resultFormat',
});

test('Should return resultType when resultFormat!=csv', () => {
  expect(getLegacyEndpointType(createParams())).toBe('resultType');
});

test('Should return resultFormat when resultFormat:csv', () => {
  expect(
    getLegacyEndpointType({ ...createParams(), resultFormat: 'csv' }),
  ).toBe('csv');
});

test('Should return resultFormat when resultFormat:xlsx', () => {
  expect(
    getLegacyEndpointType({ ...createParams(), resultFormat: 'xlsx' }),
  ).toBe('xlsx');
});
