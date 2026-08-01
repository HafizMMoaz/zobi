import { VizType } from '@zobi.dev/core';
import {
  retainFormDataSuffix,
  removeFormDataSuffix,
} from '../../src/utils/formDataSuffix';

const formData = {
  datasource: 'dummy',
  viz_type: VizType.Table,
  metrics: ['a', 'b'],
  columns: ['foo', 'bar'],
  limit: 100,
  metrics_b: ['c', 'd'],
  columns_b: ['hello', 'world'],
  limit_b: 200,
};

test('should keep controls with suffix', () => {
  expect(retainFormDataSuffix(formData, '_b')).toEqual({
    datasource: 'dummy',
    viz_type: VizType.Table,
    metrics: ['c', 'd'],
    columns: ['hello', 'world'],
    limit: 200,
  });
  // no side effect
  expect(retainFormDataSuffix(formData, '_b')).not.toEqual(formData);
});

test('should remove controls with suffix', () => {
  expect(removeFormDataSuffix(formData, '_b')).toEqual({
    datasource: 'dummy',
    viz_type: VizType.Table,
    metrics: ['a', 'b'],
    columns: ['foo', 'bar'],
    limit: 100,
  });
  // no side effect
  expect(removeFormDataSuffix(formData, '_b')).not.toEqual(formData);
});
