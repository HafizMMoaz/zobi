import buildQuery from '../../src/Tree/buildQuery';
import { EchartsTreeFormData } from '../../src/Tree/types';

const BASE_FORM_DATA: EchartsTreeFormData = {
  datasource: '5__table',
  granularity_sqla: 'ds',
  viz_type: 'my_chart',
  id: '',
  parent: '',
  name: '',
  orient: 'LR',
  symbol: 'emptyCircle',
  symbolSize: 7,
  layout: 'orthogonal',
  roam: true,
  nodeLabelPosition: 'left',
  childLabelPosition: 'bottom',
  emphasis: 'descendant',
  initialTreeDepth: 2,
  metrics: [],
};

describe('Tree buildQuery', () => {
  test('should build query', () => {
    const formData: EchartsTreeFormData = {
      ...BASE_FORM_DATA,
      id: 'id_col',
      parent: 'relation_col',
      name: 'name_col',
      metrics: ['foo', 'bar'],
    };
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['id_col', 'relation_col', 'name_col']);
    expect(query.metrics).toEqual(['foo', 'bar']);
  });
  test('should build query without name column', () => {
    const formData: EchartsTreeFormData = {
      ...BASE_FORM_DATA,
      id: 'id_col',
      parent: 'relation_col',
      name: '',
      metrics: ['foo', 'bar'],
    };
    const queryContext = buildQuery(formData);
    const [query] = queryContext.queries;
    expect(query.columns).toEqual(['id_col', 'relation_col']);
    expect(query.metrics).toEqual(['foo', 'bar']);
  });
});
