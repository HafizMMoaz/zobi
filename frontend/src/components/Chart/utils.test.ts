import { getMenuAdjustedY } from './utils';

const originalInnerHeight = window.innerHeight;

beforeEach(() => {
  window.innerHeight = 500;
});

afterEach(() => {
  window.innerHeight = originalInnerHeight;
});

test('correctly positions at upper edge of screen', () => {
  expect(getMenuAdjustedY(75, 1)).toEqual(75); // No adjustment
  expect(getMenuAdjustedY(75, 2)).toEqual(75); // No adjustment
  expect(getMenuAdjustedY(75, 3)).toEqual(75); // No adjustment
});

test('correctly positions at lower edge of screen', () => {
  expect(getMenuAdjustedY(425, 1)).toEqual(425); // No adjustment
  expect(getMenuAdjustedY(425, 2)).toEqual(404); // Adjustment
  expect(getMenuAdjustedY(425, 3)).toEqual(372); // Adjustment

  expect(getMenuAdjustedY(425, 8, 200)).toEqual(268);
  expect(getMenuAdjustedY(425, 8, 200, 48)).toEqual(220);
});
