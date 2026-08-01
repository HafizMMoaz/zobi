import { getHostName } from '.';

jest.mock('src/utils/hostNamesConfig', () => ({
  availableDomains: [
    'domain-a',
    'domain-b',
    'domain-c',
    'domain-d',
    'domain-e',
    'domain-f',
    'domain-g',
  ],
}));

test('Should get next different domain on a loop, never the first on the list', () => {
  for (let loop = 3; loop > 0; loop -= 1) {
    expect(getHostName(true)).toBe('domain-b');
    expect(getHostName(true)).toBe('domain-c');
    expect(getHostName(true)).toBe('domain-d');
    expect(getHostName(true)).toBe('domain-e');
    expect(getHostName(true)).toBe('domain-f');
    expect(getHostName(true)).toBe('domain-g');
  }
});

test('Should always return the same domain, the first on the list', () => {
  expect(getHostName(false)).toBe('domain-a');
  expect(getHostName(false)).toBe('domain-a');
});

test('Should always return the same domain, the first on the list - no args', () => {
  expect(getHostName()).toBe('domain-a');
  expect(getHostName()).toBe('domain-a');
});
