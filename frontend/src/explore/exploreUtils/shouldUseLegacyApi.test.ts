import { getChartMetadataRegistry } from '@zobi-ui/core';
import { getQuerySettings } from '.';

jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  getChartMetadataRegistry: jest.fn(),
}));

const mockedGetChartMetadataRegistry = getChartMetadataRegistry as jest.Mock;

test('Should return false', () => {
  const get = jest.fn();
  mockedGetChartMetadataRegistry.mockReturnValue({ get } as any);
  expect(get).toHaveBeenCalledTimes(0);
  const [useLegacyApi] = getQuerySettings({ viz_type: 'name_test' });
  expect(useLegacyApi).toBe(false);
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('name_test');
});

test('Should return true', () => {
  const get = jest.fn();
  get.mockReturnValue({ useLegacyApi: true });
  mockedGetChartMetadataRegistry.mockReturnValue({ get } as any);
  expect(get).toHaveBeenCalledTimes(0);
  const [useLegacyApi] = getQuerySettings({ viz_type: 'name_test' });
  expect(useLegacyApi).toBe(true);
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('name_test');
});

test('Should return false when useLegacyApi:false', () => {
  const get = jest.fn();
  get.mockReturnValue({ useLegacyApi: false });
  mockedGetChartMetadataRegistry.mockReturnValue({ get } as any);
  expect(get).toHaveBeenCalledTimes(0);
  const [useLegacyApi] = getQuerySettings({ viz_type: 'name_test' });
  expect(useLegacyApi).toBe(false);
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('name_test');
});
