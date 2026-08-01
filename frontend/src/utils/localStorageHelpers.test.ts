import {
  getItem,
  setItem,
  LocalStorageKeys,
} from 'src/utils/localStorageHelpers';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('localStorageHelpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    localStorage.clear();
  });

  test('gets a value that was set', () => {
    setItem(LocalStorageKeys.IsDatapanelOpen, false);

    expect(getItem(LocalStorageKeys.IsDatapanelOpen, true)).toBe(false);
  });

  test('returns the default value for an unset value', () => {
    expect(getItem(LocalStorageKeys.IsDatapanelOpen, true)).toBe(true);
  });
});
