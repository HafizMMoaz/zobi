

import fetchMock from 'fetch-mock';
import {
  ZobiClientClass,
  ZobiClient,
  buildQueryContext,
  QueryFormData,
  ChartClient,
  getChartBuildQueryRegistry,
  getChartMetadataRegistry,
  ChartMetadata,
  VizType,
} from '@zobi-ui/core';
import { configure as configureTranslation } from '@zobi/core/translation';

import { LOGIN_GLOB } from '../fixtures/constants';
import { sankeyFormData } from '../fixtures/formData';
import { SliceIdAndOrFormData } from '../../../src/chart/clients/ChartClient';

configureTranslation();

beforeAll(() => fetchMock.mockGlobal());
afterAll(() => fetchMock.hardReset());

describe('ChartClient', () => {
  let chartClient: ChartClient;

  beforeAll(() => {
    fetchMock.get(LOGIN_GLOB, { result: '1234' });
    ZobiClient.reset();
    ZobiClient.configure().init();
  });

  beforeEach(() => {
    chartClient = new ChartClient();
  });

  afterEach(() => fetchMock.removeRoutes().clearHistory());

  describe('new ChartClient(config)', () => {
    test('creates a client without argument', () => {
      expect(chartClient).toBeInstanceOf(ChartClient);
    });
    test('creates a client with specified config.client', () => {
      const customClient = new ZobiClientClass();
      chartClient = new ChartClient({ client: customClient });
      expect(chartClient).toBeInstanceOf(ChartClient);
      expect(chartClient.client).toBe(customClient);
    });
  });

  describe('.loadFormData({ sliceId, formData }, options)', () => {
    const sliceId = 123;
    test('fetches formData if given only sliceId', () => {
      fetchMock.get(
        `glob:*/api/v1/form_data/?slice_id=${sliceId}`,
        sankeyFormData,
      );

      return expect(chartClient.loadFormData({ sliceId })).resolves.toEqual(
        sankeyFormData,
      );
    });
    test('fetches formData from sliceId and merges with specify formData if both fields are specified', () => {
      fetchMock.get(
        `glob:*/api/v1/form_data/?slice_id=${sliceId}`,
        sankeyFormData,
      );

      return expect(
        chartClient.loadFormData({
          sliceId,
          formData: {
            granularity: 'second',
            viz_type: VizType.Bar,
          },
        }),
      ).resolves.toEqual({
        ...sankeyFormData,
        granularity: 'second',
        viz_type: VizType.Bar,
      });
    });
    test('returns promise of formData if only formData was given', () =>
      expect(
        chartClient.loadFormData({
          formData: {
            datasource: '1__table',
            granularity: 'minute',
            viz_type: VizType.Line,
          },
        }),
      ).resolves.toEqual({
        datasource: '1__table',
        granularity: 'minute',
        viz_type: VizType.Line,
      }));
    test('rejects if none of sliceId or formData is specified', () =>
      expect(
        chartClient.loadFormData({} as SliceIdAndOrFormData),
      ).rejects.toEqual(
        new Error('At least one of sliceId or formData must be specified'),
      ));
  });

  describe('.loadQueryData(formData, options)', () => {
    test('returns a promise of query data for known chart type', () => {
      getChartMetadataRegistry().registerValue(
        VizType.WordCloud,
        new ChartMetadata({ name: 'Word Cloud', thumbnail: '' }),
      );

      getChartBuildQueryRegistry().registerValue(
        VizType.WordCloud,
        (formData: QueryFormData) => buildQueryContext(formData),
      );
      fetchMock.post('glob:*/api/v1/chart/data', [
        {
          field1: 'abc',
          field2: 'def',
        },
      ]);

      return expect(
        chartClient.loadQueryData({
          granularity: 'minute',
          viz_type: VizType.WordCloud,
          datasource: '1__table',
        }),
      ).resolves.toEqual([
        {
          field1: 'abc',
          field2: 'def',
        },
      ]);
    });
    test('returns a promise that rejects for unknown chart type', () =>
      expect(
        chartClient.loadQueryData({
          granularity: 'minute',
          viz_type: 'rainbow_3d_pie',
          datasource: '1__table',
        }),
      ).rejects.toEqual(new Error('Unknown chart type: rainbow_3d_pie')));

    test('fetches data from the legacy API if ChartMetadata has useLegacyApi=true,', () => {
      // note legacy charts do not register a buildQuery function in the registry
      getChartMetadataRegistry().registerValue(
        'word_cloud_legacy',
        new ChartMetadata({
          name: 'Legacy Word Cloud',
          thumbnail: '.png',
          useLegacyApi: true,
        }),
      );

      fetchMock.post('glob:*/api/v1/chart/data', () =>
        Promise.reject(new Error('Unexpected all to v1 API')),
      );

      fetchMock.post('glob:*/zobi/explore_json/', {
        field1: 'abc',
        field2: 'def',
      });

      return expect(
        chartClient.loadQueryData({
          granularity: 'minute',
          viz_type: 'word_cloud_legacy',
          datasource: '1__table',
        }),
      ).resolves.toEqual([
        {
          field1: 'abc',
          field2: 'def',
        },
      ]);
    });
  });

  describe('.loadDatasource(datasourceKey, options)', () => {
    test('fetches datasource', () => {
      fetchMock.get(
        'glob:*/zobi/fetch_datasource_metadata?datasourceKey=1__table',
        {
          field1: 'abc',
          field2: 'def',
        },
      );

      return expect(chartClient.loadDatasource('1__table')).resolves.toEqual({
        field1: 'abc',
        field2: 'def',
      });
    });
  });

  describe('.loadAnnotation(annotationLayer)', () => {
    test('returns an empty object if the annotation layer does not require query', () =>
      expect(
        chartClient.loadAnnotation({
          name: 'my-annotation',
        }),
      ).resolves.toEqual({}));
    test('otherwise returns a rejected promise because it is not implemented yet', () =>
      expect(
        chartClient.loadAnnotation({
          name: 'my-annotation',
          sourceType: 'abc',
        }),
      ).rejects.toEqual(new Error('This feature is not implemented yet.')));
  });

  describe('.loadAnnotations(annotationLayers)', () => {
    test('loads multiple annotation layers and combine results', () =>
      expect(
        chartClient.loadAnnotations([
          {
            name: 'anno1',
          },
          {
            name: 'anno2',
          },
          {
            name: 'anno3',
          },
        ]),
      ).resolves.toEqual({
        anno1: {},
        anno2: {},
        anno3: {},
      }));
    test('returns an empty object if input is not an array', () =>
      expect(chartClient.loadAnnotations()).resolves.toEqual({}));
    test('returns an empty object if input is an empty array', () =>
      expect(chartClient.loadAnnotations()).resolves.toEqual({}));
  });

  describe('.loadChartData({ sliceId, formData })', () => {
    const sliceId = 10120;
    test('loadAllDataNecessaryForAChart', () => {
      fetchMock.get(`glob:*/api/v1/form_data/?slice_id=${sliceId}`, {
        granularity: 'minute',
        viz_type: VizType.Line,
        datasource: '1__table',
        color: 'living-coral',
      });

      fetchMock.get(
        'glob:*/zobi/fetch_datasource_metadata?datasourceKey=1__table',
        {
          name: 'transactions',
          schema: 'staging',
        },
      );

      fetchMock.post('glob:*/api/v1/chart/data', {
        lorem: 'ipsum',
        dolor: 'sit',
        amet: true,
      });

      getChartMetadataRegistry().registerValue(
        VizType.Line,
        new ChartMetadata({ name: 'Line', thumbnail: '.gif' }),
      );

      getChartBuildQueryRegistry().registerValue(
        VizType.Line,
        (formData: QueryFormData) => buildQueryContext(formData),
      );

      return expect(
        chartClient.loadChartData({
          sliceId,
        }),
      ).resolves.toEqual({
        annotationData: {},
        datasource: {
          name: 'transactions',
          schema: 'staging',
        },
        formData: {
          granularity: 'minute',
          viz_type: VizType.Line,
          datasource: '1__table',
          color: 'living-coral',
        },
        queriesData: [
          {
            lorem: 'ipsum',
            dolor: 'sit',
            amet: true,
          },
        ],
      });
    });
  });
});
