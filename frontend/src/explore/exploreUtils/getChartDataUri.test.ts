import { ensureAppRoot } from 'src/utils/pathUtils';
import { getChartDataUri } from '.';

jest.mock('src/utils/pathUtils');

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('Get ChartUri', () => {
  (ensureAppRoot as jest.Mock).mockImplementation(
    (path: string) => `/prefix${path}`,
  );

  test('Get ChartUri when allowDomainSharding:false', () => {
    expect(
      getChartDataUri({
        path: '/path',
        qs: { key: 'same-string' },
        allowDomainSharding: false,
      }),
    ).toEqual({
      _deferred_build: true,
      _parts: {
        duplicateQueryParameters: false,
        escapeQuerySpace: true,
        fragment: null,
        hostname: 'localhost',
        password: null,
        path: '/prefix/path',
        port: '',
        preventInvalidHostname: false,
        protocol: 'http',
        query: 'key=same-string',
        urn: null,
        username: null,
      },
      _string: '',
    });
  });

  test('Get ChartUri when allowDomainSharding:true', () => {
    expect(
      getChartDataUri({
        path: '/path-allowDomainSharding-true',
        qs: { key: 'allowDomainSharding-true' },
        allowDomainSharding: true,
      }),
    ).toEqual({
      _deferred_build: true,
      _parts: {
        duplicateQueryParameters: false,
        escapeQuerySpace: true,
        fragment: null,
        hostname: undefined,
        password: null,
        path: '/prefix/path-allowDomainSharding-true',
        port: '',
        preventInvalidHostname: false,
        protocol: 'http',
        query: 'key=allowDomainSharding-true',
        urn: null,
        username: null,
      },
      _string: '',
    });
  });
});
