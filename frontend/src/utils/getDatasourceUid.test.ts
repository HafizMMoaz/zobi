import { DatasourceType } from '@zobi.dev/core';
import { getDatasourceUid } from './getDatasourceUid';

const TEST_DATASOURCE = {
  id: 2,
  type: DatasourceType.Table,
  columns: [],
  metrics: [],
  column_formats: {},
  verbose_map: {},
  main_dttm_col: '__timestamp',
  // eg. ['["ds", true]', 'ds [asc]']
  datasource_name: 'test datasource',
  description: null,
};

const TEST_DATASOURCE_WITH_UID = {
  ...TEST_DATASOURCE,
  uid: 'dataset_uid',
};

test('creates uid from id and type when dataset does not have uid field', () => {
  expect(getDatasourceUid(TEST_DATASOURCE)).toEqual('2__table');
});

test('returns uid when dataset has uid field', () => {
  expect(getDatasourceUid(TEST_DATASOURCE_WITH_UID)).toEqual(
    TEST_DATASOURCE_WITH_UID.uid,
  );
});
