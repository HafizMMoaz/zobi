import { getExtensionsRegistry } from '@zobi-ui/core';

test('should get instance of getExtensionsRegistry', () => {
  expect(getExtensionsRegistry().name).toBe('ExtensionsRegistry');
});
