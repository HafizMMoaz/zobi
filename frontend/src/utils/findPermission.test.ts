import { findPermission } from './findPermission';

test('findPermission for single role', () => {
  expect(findPermission('abc', 'def', { role: [['abc', 'def']] })).toEqual(
    true,
  );

  expect(findPermission('abc', 'def', { role: [['abc', 'de']] })).toEqual(
    false,
  );

  expect(findPermission('abc', 'def', { role: [] })).toEqual(false);
});

test('findPermission for multiple roles', () => {
  expect(
    findPermission('abc', 'def', {
      role1: [
        ['ccc', 'aaa'],
        ['abc', 'def'],
      ],
      role2: [['abc', 'def']],
    }),
  ).toEqual(true);

  expect(
    findPermission('abc', 'def', {
      role1: [['abc', 'def']],
      role2: [['abc', 'dd']],
    }),
  ).toEqual(true);

  expect(
    findPermission('abc', 'def', {
      role1: [['ccc', 'aaa']],
      role2: [['aaa', 'ddd']],
    }),
  ).toEqual(false);

  expect(findPermission('abc', 'def', { role1: [], role2: [] })).toEqual(false);
});

test('handles nonexistent roles', () => {
  expect(findPermission('abc', 'def', null)).toEqual(false);
});
