type adhocFilter = {
  expressionType: string;
  subject: string;
  operator: string;
  comparator: string;
  clause: string;
  sqlExpression: string | null;
  filterOptionName: string;
};

describe('Visualization > Graph', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/v1/chart/data*').as('getJson');
  });

  const GRAPH_FORM_DATA = {
    datasource: '1__table',
    viz_type: 'graph_chart',
    slice_id: 55,
    granularity_sqla: 'ds',
    time_grain_sqla: 'P1D',
    time_range: '100 years ago : now',
    metric: 'sum__value',
    adhoc_filters: [],
    source: 'source',
    target: 'target',
    row_limit: 50000,
    show_legend: true,
    color_scheme: 'bnbColors',
  };

  function verify(formData: {
    [name: string]: string | boolean | number | Array<adhocFilter>;
  }): void {
    cy.visitChartByParams(formData);
    cy.verifySliceSuccess({ waitAlias: '@getJson' });
  }

  it('should work with ad-hoc metric', () => {
    verify(GRAPH_FORM_DATA);
    cy.get('.chart-container .graph_chart canvas').should('have.length', 1);
  });

  it('should work with simple filter', () => {
    verify({
      ...GRAPH_FORM_DATA,
      adhoc_filters: [
        {
          expressionType: 'SIMPLE',
          subject: 'source',
          operator: '==',
          comparator: 'Agriculture',
          clause: 'WHERE',
          sqlExpression: null,
          filterOptionName: 'filter_tqx1en70hh_7nksse7nqic',
        },
      ],
    });
    cy.get('.chart-container .graph_chart canvas').should('have.length', 1);
  });

  it('should allow type to search color schemes', () => {
    verify(GRAPH_FORM_DATA);

    cy.get('#controlSections-tab-CUSTOMIZE').click();
    cy.get('.Control[data-test="color_scheme"]').scrollIntoView();
    cy.get('.Control[data-test="color_scheme"] input[type="search"]').focus();
    cy.focused().type('bnbColors{enter}');
    cy.get(
      '.Control[data-test="color_scheme"] .ant-select-selection-item [data-test="bnbColors"]',
    ).should('exist');
  });
});
