import getDashboardUrl from 'src/dashboard/util/getDashboardUrl';
import { DASHBOARD_FILTER_SCOPE_GLOBAL } from 'src/dashboard/reducers/dashboardFilters';
import { DashboardStandaloneMode } from 'src/dashboard/util/constants';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getChartIdsFromLayout', () => {
  const filters = {
    '35_key': {
      values: ['value'],
      scope: DASHBOARD_FILTER_SCOPE_GLOBAL,
    },
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should encode filters', () => {
    const url = getDashboardUrl({
      pathname: 'path',
      filters,
      hash: '',
    });
    expect(url).toBe(
      'path?preselect_filters=%7B%2235%22%3A%7B%22key%22%3A%5B%22value%22%5D%7D%7D',
    );
  });

  test('should encode filters with hash', () => {
    const urlWithHash = getDashboardUrl({
      pathname: 'path',
      filters,
      hash: 'iamhashtag',
    });
    expect(urlWithHash).toBe(
      'path?preselect_filters=%7B%2235%22%3A%7B%22key%22%3A%5B%22value%22%5D%7D%7D#iamhashtag',
    );
  });

  test('should encode filters with standalone', () => {
    const urlWithStandalone = getDashboardUrl({
      pathname: 'path',
      filters,
      hash: '',
      standalone: DashboardStandaloneMode.HideNav,
    });
    expect(urlWithStandalone).toBe(
      `path?preselect_filters=%7B%2235%22%3A%7B%22key%22%3A%5B%22value%22%5D%7D%7D&standalone=${DashboardStandaloneMode.HideNav}`,
    );
  });

  test('should encode filters with missing standalone', () => {
    const urlWithStandalone = getDashboardUrl({
      pathname: 'path',
      filters,
      hash: '',
      standalone: null,
    });
    expect(urlWithStandalone).toBe(
      'path?preselect_filters=%7B%2235%22%3A%7B%22key%22%3A%5B%22value%22%5D%7D%7D',
    );
  });

  test('should encode filters with missing filters', () => {
    const urlWithStandalone = getDashboardUrl({
      pathname: 'path',
      filters: {},
      hash: '',
      standalone: DashboardStandaloneMode.HideNav,
    });
    expect(urlWithStandalone).toBe(
      `path?standalone=${DashboardStandaloneMode.HideNav}`,
    );
  });

  test('should preserve unknown filters', () => {
    jest.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      origin: 'https://localhost',
      search: '?unknown_param=value',
    } as Location);
    const urlWithStandalone = getDashboardUrl({
      pathname: 'path',
      filters: {},
      hash: '',
      standalone: DashboardStandaloneMode.HideNav,
    });
    expect(urlWithStandalone).toBe(
      `path?unknown_param=value&standalone=${DashboardStandaloneMode.HideNav}`,
    );
  });

  test('should pass through a router-relative pathname unchanged', () => {
    const url = getDashboardUrl({
      pathname: '/dashboard/1/',
      filters: {},
      hash: '',
      standalone: DashboardStandaloneMode.HideNav,
    });
    expect(url).toBe(
      `/dashboard/1/?standalone=${DashboardStandaloneMode.HideNav}`,
    );
  });

  test('should process native filters key', () => {
    jest.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      origin: 'https://localhost',
      search:
        '?preselect_filters=%7B%7D&native_filters_key=024380498jdkjf-2094838',
    } as Location);

    const urlWithNativeFilters = getDashboardUrl({
      pathname: 'path',
      filters: {},
      hash: '',
    });
    expect(urlWithNativeFilters).toBe(
      'path?preselect_filters=%7B%7D&native_filters_key=024380498jdkjf-2094838',
    );
  });
});
