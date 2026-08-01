import { buildQueryContext, QueryFormData } from '@zobi.dev/core';
import { GenericDataType } from '@zobi.dev/extension-api/common';

/**
 * The buildQuery function is used to create an instance of QueryContext that's
 * sent to the chart data endpoint. In addition to containing information of which
 * datasource to use, it specifies the type (e.g. full payload, samples, query) and
 * format (e.g. CSV or JSON) of the result and whether or not to force refresh the data from
 * the datasource as opposed to using a cached copy of the data, if available.
 *
 * More importantly though, QueryContext contains a property `queries`, which is an array of
 * QueryObjects specifying individual data requests to be made. A QueryObject specifies which
 * columns, metrics and filters, among others, to use during the query. Usually it will be enough
 * to specify just one query based on the baseQueryObject, but for some more advanced use cases
 * it is possible to define post processing operations in the QueryObject, or multiple queries
 * if a viz needs multiple different result sets.
 */
export default function buildQuery(formData: QueryFormData) {
  const { groupby } = formData;
  const [column = ''] = groupby || [];
  // @ts-expect-error (need update interface Column )
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      columns: [],
      metrics: [
        {
          aggregate: 'MIN',
          column: {
            column_name: column,
            id: 1,
            type_generic: GenericDataType.Numeric,
          },
          expressionType: 'SIMPLE',
          hasCustomLabel: true,
          label: 'min',
        },
        {
          aggregate: 'MAX',
          column: {
            column_name: column,
            id: 2,
            type_generic: GenericDataType.Numeric,
          },
          expressionType: 'SIMPLE',
          hasCustomLabel: true,
          label: 'max',
        },
      ],
    },
  ]);
}
