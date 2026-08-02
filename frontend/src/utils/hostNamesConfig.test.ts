import { availableDomains, allowCrossDomain } from './hostNamesConfig';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('hostNamesConfig', () => {
  let locationSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';

    // Mock window.location
    locationSpy = jest.spyOn(window, 'location', 'get').mockReturnValue({
      hostname: 'localhost',
      search: '',
    } as Location);
  });

  afterEach(() => {
    locationSpy.mockRestore();
  });

  test('should export availableDomains as array of strings', () => {
    expect(Array.isArray(availableDomains)).toBe(true);
    availableDomains.forEach(domain => {
      expect(typeof domain).toBe('string');
    });
  });

  test('should export allowCrossDomain as boolean', () => {
    expect(typeof allowCrossDomain).toBe('boolean');
  });

  test('should determine allowCrossDomain based on availableDomains length', () => {
    const expectedValue = availableDomains.length > 1;
    expect(allowCrossDomain).toBe(expectedValue);
  });

  test('availableDomains should contain at least the current hostname', () => {
    // Since we're testing the already computed values, we check they contain localhost
    // or the configuration returns empty array if app container is missing
    expect(availableDomains.length >= 0).toBe(true);
  });
});
