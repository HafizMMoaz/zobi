import { buildQueryContext, VizType } from '@zobi-ui/core';
import * as queryModule from '../../src/query/normalizeTimeColumn';

describe('buildQueryContext', () => {
  test('should build datasource for table sources and apply defaults', () => {
    const queryContext = buildQueryContext({
      datasource: '5__table',
      granularity_sqla: 'ds',
      viz_type: VizType.Table,
    });
    expect(queryContext.datasource.id).toBe(5);
    expect(queryContext.datasource.type).toBe('table');
    expect(queryContext.force).toBe(false);
    expect(queryContext.result_format).toBe('json');
    expect(queryContext.result_type).toBe('full');
  });
  test('should build datasource for table sources with columns', () => {
    const queryContext = buildQueryContext(
      {
        datasource: '5__table',
        granularity_sqla: 'ds',
        viz_type: VizType.Table,
        source: 'source_column',
        source_category: 'source_category_column',
        target: 'target_column',
        target_category: 'target_category_column',
      },
      {
        queryFields: {
          source: 'columns',
          source_category: 'columns',
          target: 'columns',
          target_category: 'columns',
        },
      },
    );
    expect(queryContext.datasource.id).toBe(5);
    expect(queryContext.datasource.type).toBe('table');
    expect(queryContext.force).toBe(false);
    expect(queryContext.result_format).toBe('json');
    expect(queryContext.result_type).toBe('full');
    expect(queryContext.queries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          columns: [
            'source_column',
            'source_category_column',
            'target_column',
            'target_category_column',
          ],
        }),
      ]),
    );
  });
  test('should build datasource for table sources and process with custom function', () => {
    const queryContext = buildQueryContext(
      {
        datasource: '5__table',
        granularity_sqla: 'ds',
        viz_type: VizType.Table,
        source: 'source_column',
        source_category: 'source_category_column',
        target: 'target_column',
        target_category: 'target_category_column',
      },
      function addExtraColumn(queryObject) {
        return [{ ...queryObject, columns: ['dummy_column'] }];
      },
    );
    expect(queryContext.datasource.id).toBe(5);
    expect(queryContext.datasource.type).toBe('table');
    expect(queryContext.force).toBe(false);
    expect(queryContext.result_format).toBe('json');
    expect(queryContext.result_type).toBe('full');
    expect(queryContext.queries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          columns: ['dummy_column'],
        }),
      ]),
    );
  });
  // todo(Yongjie): move these test case into buildQueryObject.test.ts
  test('should remove undefined value in post_processing', () => {
    const queryContext = buildQueryContext(
      {
        datasource: '5__table',
        viz_type: VizType.Table,
      },
      () => [
        {
          post_processing: [
            undefined,
            undefined,
            {
              operation: 'flatten',
            },
            undefined,
          ],
        },
      ],
    );
    expect(queryContext.queries[0].post_processing).toEqual([
      {
        operation: 'flatten',
      },
    ]);
  });
  test('should call normalizeTimeColumn if has x_axis', () => {
    const spyNormalizeTimeColumn = jest.spyOn(
      queryModule,
      'normalizeTimeColumn',
    );

    buildQueryContext(
      {
        datasource: '5__table',
        viz_type: VizType.Table,
        x_axis: 'axis',
      },
      () => [{}],
    );
    expect(spyNormalizeTimeColumn).toHaveBeenCalled();
    spyNormalizeTimeColumn.mockRestore();
  });
});
