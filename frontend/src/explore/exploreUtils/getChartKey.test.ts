import { Slice } from 'src/types/Chart';
import { getChartKey } from '.';

test('should return "slice_id" when called with an object that has "slice.slice_id"', () => {
  expect(getChartKey({ slice: { slice_id: 100 } as unknown as Slice })).toBe(
    100,
  );
});
