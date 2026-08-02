import withLabel from './withLabel';

test('withLabel returns false when validator passes', () => {
  const validator = () => false as false;
  const labeled = withLabel(validator, 'Field');
  expect(labeled('any value')).toBe(false);
});

test('withLabel prepends label to validator error message', () => {
  const validator = () => 'is required';
  const labeled = withLabel(validator, 'Name');
  expect(labeled('')).toBe('Name is required');
});

test('withLabel passes value and state to underlying validator', () => {
  const validator = jest.fn(() => false as false);
  const labeled = withLabel(validator, 'Field');
  labeled('value', { someState: true });
  expect(validator).toHaveBeenCalledWith('value', { someState: true });
});
