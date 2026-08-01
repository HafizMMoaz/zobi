import { FORM_DATA_DEFAULTS, NUM_METRIC } from './shared.helper';

describe('Download Chart > Bar chart', () => {
  const VIZ_DEFAULTS = {
    ...FORM_DATA_DEFAULTS,
    viz_type: 'echarts_timeseries_bar',
  };

  beforeEach(() => {
    cy.intercept('POST', '**/zobi/explore_json/**').as('getJson');
  });

  it('download chart with image works', () => {
    const formData = {
      ...VIZ_DEFAULTS,
      metrics: NUM_METRIC,
      groupby: ['state'],
    };

    cy.visitChartByParams(formData);
    cy.get('.header-with-actions .ant-dropdown-trigger').click();
    cy.get(':nth-child(3) > .ant-dropdown-menu-submenu-title').click();
    cy.get(
      '.ant-dropdown-menu-submenu > .ant-dropdown-menu li:nth-child(1) > .ant-dropdown-menu-submenu-title',
    ).click();
    cy.get(
      '.ant-dropdown-menu-submenu > .ant-dropdown-menu li:nth-child(3)',
    ).click();

    cy.verifyDownload('.jpg', {
      contains: true,
      timeout: 25000,
      interval: 600,
    });
  });
});
