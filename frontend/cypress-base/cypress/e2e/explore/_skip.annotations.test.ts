import { interceptChart } from 'cypress/utils';

describe('Annotations', () => {
  beforeEach(() => {
    interceptChart({ legacy: false }).as('chartData');
  });

  it('Create formula annotation y-axis goal line', () => {
    cy.visitChartByName('Num Births Trend');
    cy.verifySliceSuccess({ waitAlias: '@chartData' });

    const layerLabel = 'Goal line';

    // get by text Annotations and Layers
    cy.get('span').contains('Annotations and Layers').click();

    cy.get('[data-test=annotation_layers]').click();

    cy.get('[data-test="popover-content"]').within(() => {
      cy.get('[aria-label=Name]').type(layerLabel);
      cy.get('[aria-label=Formula]').type('y=1400000');
      cy.get('button').contains('OK').click();
    });

    cy.get('button[data-test="run-query-button"]').click();
    cy.get('[data-test=annotation_layers]').contains(layerLabel);

    cy.verifySliceSuccess({ waitAlias: '@chartData' });
  });
});
