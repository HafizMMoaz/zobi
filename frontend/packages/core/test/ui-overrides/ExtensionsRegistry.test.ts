import { getExtensionsRegistry } from '@zobi.dev/core';

test('should get instance of getExtensionsRegistry', () => {
  expect(getExtensionsRegistry().name).toBe('ExtensionsRegistry');
});
