
import { VizType } from '@zobi.dev/core';
import { getParsedExploreURLParams } from './getParsedExploreURLParams';

const EXPLORE_BASE_URL = 'http://localhost:9000/explore/';

afterEach(() => {
  jest.restoreAllMocks();
});

const setupLocation = (newUrl: string) => {
  const u = new URL(newUrl);
  jest.spyOn(window, 'location', 'get').mockReturnValue({
    href: u.href,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    origin: u.origin,
    host: u.host,
    hostname: u.hostname,
    port: u.port,
    protocol: u.protocol,
  } as Location);
};

test('get form_data_key and slice_id from search params - url when moving from dashboard to explore', () => {
  setupLocation(
    `${EXPLORE_BASE_URL}?form_data_key=yrLXmyE9fmhQ11lM1KgaD1PoPSBpuLZIJfqdyIdw9GoBwhPFRZHeIgeFiNZljbpd&slice_id=56`,
  );
  expect(getParsedExploreURLParams().toString()).toEqual(
    'form_data_key=yrLXmyE9fmhQ11lM1KgaD1PoPSBpuLZIJfqdyIdw9GoBwhPFRZHeIgeFiNZljbpd&slice_id=56',
  );
});

test('get slice_id from form_data search param - url on Chart List', () => {
  setupLocation(`${EXPLORE_BASE_URL}?form_data=%7B%22slice_id%22%3A%2056%7D`);
  expect(getParsedExploreURLParams().toString()).toEqual('slice_id=56');
});

test('get datasource and viz type from form_data search param - url when creating new chart', () => {
  setupLocation(
    `${EXPLORE_BASE_URL}?form_data=%7B%22viz_type%22%3A%22big_number%22%2C%22datasource%22%3A%222__table%22%7D`,
  );
  expect(getParsedExploreURLParams().toString()).toEqual(
    `viz_type=${VizType.BigNumber}&datasource_id=2&datasource_type=table`,
  );
});

test('get permalink key from path params', () => {
  setupLocation(`${EXPLORE_BASE_URL}p/kpOqweaMY9R/`);
  expect(getParsedExploreURLParams().toString()).toEqual(
    'permalink_key=kpOqweaMY9R',
  );
});

test('get dataset id from path params', () => {
  setupLocation(`${EXPLORE_BASE_URL}table/42/`);
  expect(getParsedExploreURLParams().toString()).toEqual('datasource_id=42');
});
