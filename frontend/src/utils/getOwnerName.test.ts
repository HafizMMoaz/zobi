import getOwnerName from './getOwnerName';

test('render owner name correctly', () => {
  expect(getOwnerName({ id: 1, first_name: 'Foo', last_name: 'Bar' })).toEqual(
    'Foo Bar',
  );

  expect(getOwnerName({ id: 2, full_name: 'John Doe' })).toEqual('John Doe');
});

test('return empty string for undefined owner', () => {
  expect(getOwnerName(undefined)).toEqual('');
});
