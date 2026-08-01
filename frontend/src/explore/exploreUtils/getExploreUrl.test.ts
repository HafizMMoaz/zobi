import { getExploreUrl } from '.';

const createParams = () => ({
  formData: {
    datasource: 'datasource',
    viz_type: 'viz_type',
  },
  endpointType: 'base',
  force: false,
  curUrl: null,
  requestParams: {},
  allowDomainSharding: false,
  method: 'POST' as const,
});

test('Get ExploreUrl with default params', () => {
  const params = createParams();
  expect(getExploreUrl(params)).toBe('http://localhost/explore/');
});

test('Get ExploreUrl with endpointType:full', () => {
  const params = createParams();
  expect(getExploreUrl({ ...params, endpointType: 'full' })).toBe(
    'http://localhost/zobi/explore_json/',
  );
});

test('Get ExploreUrl with endpointType:full and method:GET', () => {
  const params = createParams();
  expect(
    getExploreUrl({ ...params, endpointType: 'full', method: 'GET' }),
  ).toBe('http://localhost/zobi/explore_json/');
});

test('Get relative ExploreUrl with endpointType:csv', () => {
  const params = createParams();
  expect(
    getExploreUrl({ ...params, endpointType: 'csv', relative: true }),
  ).toBe('/zobi/explore_json/?csv=true');
});

test('Get relative ExploreUrl with endpointType:xlsx', () => {
  const params = createParams();
  expect(
    getExploreUrl({ ...params, endpointType: 'xlsx', relative: true }),
  ).toBe('/zobi/explore_json/?xlsx=true');
});

test('Get relative ExploreUrl with force:true', () => {
  const params = createParams();
  expect(
    getExploreUrl({
      ...params,
      endpointType: 'csv',
      force: true,
      relative: true,
    }),
  ).toBe('/zobi/explore_json/?force=true&csv=true');
});

test('Get relative ExploreUrl with endpointType:base', () => {
  const params = createParams();
  expect(getExploreUrl({ ...params, relative: true })).toBe('/explore/');
});
