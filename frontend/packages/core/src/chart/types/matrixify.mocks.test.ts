import { isMatrixifyEnabled, MatrixifyGridRenderer } from './matrixify.mocks';

test('isMatrixifyEnabled mock returns false by default', () => {
  expect(isMatrixifyEnabled()).toBe(false);
});

test('MatrixifyGridRenderer mock returns null by default', () => {
  expect(MatrixifyGridRenderer()).toBeNull();
});
