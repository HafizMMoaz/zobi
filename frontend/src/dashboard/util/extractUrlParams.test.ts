import extractUrlParams from './extractUrlParams';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('extractUrlParams', () => {
  let locationSpy: jest.SpyInstance;

  beforeAll(() => {
    locationSpy = jest
      .spyOn(window, 'location', 'get')
      .mockReturnValue({ search: '?edit=true&abc=123' } as Location);
  });

  afterAll(() => {
    locationSpy.mockRestore();
  });

  test('returns all urlParams', () => {
    expect(extractUrlParams('all')).toEqual({
      edit: 'true',
      abc: '123',
    });
  });

  test('returns reserved urlParams', () => {
    expect(extractUrlParams('reserved')).toEqual({
      edit: 'true',
    });
  });

  test('returns regular urlParams', () => {
    expect(extractUrlParams('regular')).toEqual({
      abc: '123',
    });
  });
});
