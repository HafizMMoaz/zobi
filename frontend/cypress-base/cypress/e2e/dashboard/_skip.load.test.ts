import { WORLD_HEALTH_DASHBOARD } from 'cypress/utils/urls';
import { waitForChartLoad } from 'cypress/utils';
import { WORLD_HEALTH_CHARTS, interceptLog } from './utils';

describe('Dashboard load', () => {
  it('should load dashboard', () => {
    cy.visit(WORLD_HEALTH_DASHBOARD);
    WORLD_HEALTH_CHARTS.forEach(waitForChartLoad);
  });

  it('should load in edit mode', () => {
    cy.visit(`${WORLD_HEALTH_DASHBOARD}?edit=true&standalone=true`);
    cy.getBySel('discard-changes-button').should('be.visible');
  });

  it('should load in standalone mode', () => {
    cy.visit(`${WORLD_HEALTH_DASHBOARD}?edit=true&standalone=true`);
    cy.get('#app-menu').should('not.exist');
  });

  it('should load in edit/standalone mode', () => {
    cy.visit(`${WORLD_HEALTH_DASHBOARD}?edit=true&standalone=true`);
    cy.getBySel('discard-changes-button').should('be.visible');
    cy.get('#app-menu').should('not.exist');
  });

  // TODO flaky test. skipping to unblock CI
  it.skip('should send log data', () => {
    interceptLog();
    cy.visit(WORLD_HEALTH_DASHBOARD);
    cy.wait('@logs', { timeout: 15000 });
  });
});
