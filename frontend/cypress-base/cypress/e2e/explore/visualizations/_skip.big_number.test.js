import { interceptChart } from 'cypress/utils';

describe('Visualization > Big Number with Trendline', () => {
  beforeEach(() => {
    interceptChart({ legacy: false }).as('chartData');
  });

  const BIG_NUMBER_FORM_DATA = {
    datasource: '2__table',
    viz_type: 'big_number',
    slice_id: 42,
    granularity_sqla: 'year',
    time_grain_sqla: 'P1D',
    time_range: '2000 : 2014-01-02',
    metric: 'sum__SP_POP_TOTL',
    adhoc_filters: [],
    compare_lag: '10',
    compare_suffix: 'over 10Y',
    y_axis_format: '.3s',
    show_trend_line: true,
    start_y_axis_at_zero: true,
    color_picker: {
      r: 0,
      g: 122,
      b: 135,
      a: 1,
    },
  };

  function verify(formData) {
    cy.visitChartByParams(formData);
    cy.verifySliceSuccess({
      waitAlias: '@chartData',
      chartSelector: '.zobi-legacy-chart-big-number',
    });
  }

  it('should work', () => {
    verify(BIG_NUMBER_FORM_DATA);
    cy.get('.chart-container .header-line');
    cy.get('.chart-container canvas');
  });

  it('should work without subheader', () => {
    verify({
      ...BIG_NUMBER_FORM_DATA,
      compare_lag: null,
    });
    cy.get('.chart-container .header-line');
    cy.get('.chart-container .subtitle-line').should('not.exist');
    cy.get('.chart-container canvas');
  });

  it('should not render trendline when hidden', () => {
    verify({
      ...BIG_NUMBER_FORM_DATA,
      show_trend_line: false,
    });
    cy.get('[data-test="chart-container"] .header-line');
    cy.get('[data-test="chart-container"] canvas').should('not.exist');
  });
});
