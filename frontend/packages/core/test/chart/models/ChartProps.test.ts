

import { Behavior, ChartProps } from '@zobi.dev/core';
import { zobiTheme } from '@zobi.dev/extension-api/theme';

const RAW_FORM_DATA = {
  some_field: 1,
};

const RAW_DATASOURCE = {
  column_formats: { test: '%s' },
};

const QUERY_DATA = { data: {} };
const QUERIES_DATA = [QUERY_DATA];
const BEHAVIORS = [Behavior.NativeFilter, Behavior.InteractiveChart];

describe('ChartProps', () => {
  test('exists', () => {
    expect(ChartProps).toBeDefined();
  });
  describe('new ChartProps({})', () => {
    test('returns new instance', () => {
      const props = new ChartProps({
        width: 800,
        height: 600,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        theme: zobiTheme,
      });
      expect(props).toBeInstanceOf(ChartProps);
    });
    test('processes formData and datasource to convert field names to camelCase', () => {
      const props = new ChartProps({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        theme: zobiTheme,
      });
      expect(props.formData.someField as number).toEqual(1);
      expect(props.datasource.columnFormats).toEqual(
        RAW_DATASOURCE.column_formats,
      );
      expect(props.rawFormData).toEqual(RAW_FORM_DATA);
      expect(props.rawDatasource).toEqual(RAW_DATASOURCE);
    });
  });
  describe('ChartProps.createSelector()', () => {
    const selector = ChartProps.createSelector();
    test('returns a selector function', () => {
      expect(selector).toBeInstanceOf(Function);
    });
    test('selector returns previous chartProps if all input fields do not change', () => {
      const props1 = selector({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        behaviors: BEHAVIORS,
        isRefreshing: false,
        theme: zobiTheme,
      });
      const props2 = selector({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        behaviors: BEHAVIORS,
        isRefreshing: false,
        theme: zobiTheme,
      });
      expect(props1).toBe(props2);
    });
    test('selector returns a new chartProps if the 13th field changes', () => {
      /** this test is here to test for selectors that exceed 12 arguments (
       * isRefreshing is the 13th argument, which is missing TS declarations).
       * See: https://github.com/reduxjs/reselect/issues/378
       */

      const props1 = selector({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        behaviors: BEHAVIORS,
        isRefreshing: false,
        theme: zobiTheme,
      });
      const props2 = selector({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        behaviors: BEHAVIORS,
        isRefreshing: true,
        theme: zobiTheme,
      });
      expect(props1).not.toBe(props2);
    });
    test('selector returns a new chartProps if some input fields change and returns memoized chart props', () => {
      const props1 = selector({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        theme: zobiTheme,
      });
      const props2 = selector({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: { new_field: 3 },
        queriesData: QUERIES_DATA,
        theme: zobiTheme,
      });
      const props3 = selector({
        width: 800,
        height: 600,
        datasource: RAW_DATASOURCE,
        formData: RAW_FORM_DATA,
        queriesData: QUERIES_DATA,
        theme: zobiTheme,
      });
      expect(props1).not.toBe(props2);
      expect(props1).toBe(props3);
    });
  });
});
