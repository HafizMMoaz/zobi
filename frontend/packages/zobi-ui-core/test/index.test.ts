

import {
  ExtensibleFunction,
  Plugin,
  Preset,
  Registry,
  RegistryWithDefaultKey,
  convertKeysToCamelCase,
  isDefined,
  isRequired,
  makeSingleton,
} from '@zobi-ui/core';

describe('index', () => {
  test('exports modules', () => {
    [
      ExtensibleFunction,
      Plugin,
      Preset,
      Registry,
      RegistryWithDefaultKey,
      convertKeysToCamelCase,
      isDefined,
      isRequired,
      makeSingleton,
    ].forEach(x => expect(x).toBeDefined());
  });
});
