import { interceptV1ChartData } from './utils';

describe('Advanced analytics', () => {
  beforeEach(() => {
    interceptV1ChartData();
    cy.intercept('PUT', '**/api/v1/explore/**').as('putExplore');
    cy.intercept('GET', '**/explore/**').as('getExplore');
  });

  it('Create custom time compare', () => {
    cy.visitChartByName('Num Births Trend');
    cy.verifySliceSuccess({ waitAlias: '@v1Data' });

    cy.get('.ant-collapse-header')
      .contains('Advanced analytics')
      .click({ force: true });

    cy.get('[data-test=time_compare]').find('.ant-select').click();
    cy.get('[data-test=time_compare]')
      .find('input[type=search]')
      .type('28 days{enter}');

    cy.get('[data-test=time_compare]').find('input[type=search]').clear();
    cy.get('[data-test=time_compare]')
      .find('input[type=search]')
      .type('1 year{enter}');

    cy.get('button[data-test="run-query-button"]').click();
    cy.wait('@v1Data');
    cy.wait('@putExplore');

    cy.reload();
    cy.verifySliceSuccess({
      waitAlias: '@v1Data',
    });
    cy.wait('@getExplore');
    cy.get('.ant-collapse-header')
      .contains('Advanced analytics')
      .click({ force: true });
    cy.get('[data-test=time_compare]')
      .find('.ant-select-selector')
      .contains('28 days');
    cy.get('[data-test=time_compare]')
      .find('.ant-select-selector')
      .contains('1 year');
  });
});
