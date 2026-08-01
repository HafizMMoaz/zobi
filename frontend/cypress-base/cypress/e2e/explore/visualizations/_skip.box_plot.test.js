import { getDatasetId } from './shared.helper';

describe('Visualization > Box Plot', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/v1/chart/data*').as('getJson');
  });

  const getBoxPlotFormData = datasetId => ({
    datasource: `${datasetId}__table`,
    viz_type: 'box_plot',
    granularity_sqla: 'year',
    time_grain_sqla: 'P1D',
    time_range: '1960-01-01 : now',
    metrics: ['sum__SP_POP_TOTL'],
    adhoc_filters: [],
    groupby: ['region'],
    limit: '25',
    color_scheme: 'bnbColors',
    whisker_options: 'Min/max (no outliers)',
  });

  function verify(formData) {
    cy.visitChartByParams(formData);
    cy.verifySliceSuccess({ waitAlias: '@getJson' });
  }

  it('should work', () => {
    getDatasetId('wb_health_population').then(datasetId => {
      verify(getBoxPlotFormData(datasetId));
      cy.get('.chart-container .box_plot canvas').should('have.length', 1);
    });
  });

  it('should allow type to search color schemes', () => {
    getDatasetId('wb_health_population').then(datasetId => {
      verify(getBoxPlotFormData(datasetId));

      cy.get('#controlSections-tab-CUSTOMIZE').click();
      cy.get('.Control[data-test="color_scheme"]').scrollIntoView();
      cy.get('.Control[data-test="color_scheme"] input[type="search"]').focus();
      cy.focused().type('zobiColors{enter}');
      cy.get(
        '.Control[data-test="color_scheme"] .ant-select-selection-item [data-test="zobiColors"]',
      ).should('exist');
    });
  });
});
