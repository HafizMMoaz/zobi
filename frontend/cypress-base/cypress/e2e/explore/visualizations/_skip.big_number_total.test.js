import { interceptChart } from 'cypress/utils';
import { FORM_DATA_DEFAULTS, NUM_METRIC } from './shared.helper';

describe('Visualization > Big Number Total', () => {
  beforeEach(() => {
    interceptChart({ legacy: false }).as('chartData');
  });

  const BIG_NUMBER_DEFAULTS = {
    ...FORM_DATA_DEFAULTS,
    viz_type: 'big_number_total',
  };

  it('Test big number chart with adhoc metric', () => {
    const formData = { ...BIG_NUMBER_DEFAULTS, metric: NUM_METRIC };

    cy.visitChartByParams(formData);
    cy.verifySliceSuccess({
      waitAlias: '@chartData',
      querySubstring: NUM_METRIC.label,
    });
  });

  it('Test big number chart with simple filter', () => {
    const filters = [
      {
        expressionType: 'SIMPLE',
        subject: 'name',
        operator: 'IN',
        comparator: ['Aaron', 'Amy', 'Andrea'],
        clause: 'WHERE',
        sqlExpression: null,
        filterOptionName: 'filter_4y6teao56zs_ebjsvwy48c',
      },
    ];

    const formData = {
      ...BIG_NUMBER_DEFAULTS,
      metric: 'count',
      adhoc_filters: filters,
    };

    cy.visitChartByParams(formData);
    cy.verifySliceSuccess({ waitAlias: '@chartData' });
  });

  it('Test big number chart ignores groupby', () => {
    const formData = {
      ...BIG_NUMBER_DEFAULTS,
      metric: NUM_METRIC,
      groupby: ['state'],
    };

    cy.visitChartByParams(formData);
    cy.wait(['@chartData']).then(async ({ response }) => {
      cy.verifySliceContainer();
      const responseBody = response?.body;
      expect(responseBody.result[0].query).not.contains(formData.groupby[0]);
    });
  });
});
