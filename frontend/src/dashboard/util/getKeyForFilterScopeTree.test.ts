import getKeyForFilterScopeTree from './getKeyForFilterScopeTree';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getKeyForFilterScopeTree', () => {
  test('should return stringified activeFilterField array when activeFilterField is provided', () => {
    const props = {
      activeFilterField: 'filter1',
      checkedFilterFields: ['filter2', 'filter3'],
    };

    const result = getKeyForFilterScopeTree(props);
    expect(result).toBe('["filter1"]');
  });

  test('should return stringified checkedFilterFields when activeFilterField is not provided', () => {
    const props = {
      checkedFilterFields: ['filter2', 'filter3'],
    };

    const result = getKeyForFilterScopeTree(props);
    expect(result).toBe('["filter2","filter3"]');
  });

  test('should return stringified checkedFilterFields when activeFilterField is undefined', () => {
    const props = {
      activeFilterField: undefined,
      checkedFilterFields: ['filter1'],
    };

    const result = getKeyForFilterScopeTree(props);
    expect(result).toBe('["filter1"]');
  });

  test('should return stringified empty array when both fields are empty', () => {
    const props = {
      checkedFilterFields: [],
    };

    const result = getKeyForFilterScopeTree(props);
    expect(result).toBe('[]');
  });

  test('should handle single checked filter field', () => {
    const props = {
      checkedFilterFields: ['singleFilter'],
    };

    const result = getKeyForFilterScopeTree(props);
    expect(result).toBe('["singleFilter"]');
  });

  test('should prioritize activeFilterField over checkedFilterFields', () => {
    const props = {
      activeFilterField: 'activeFilter',
      checkedFilterFields: ['checked1', 'checked2'],
    };

    const result = getKeyForFilterScopeTree(props);
    expect(result).toBe('["activeFilter"]');
  });
});
