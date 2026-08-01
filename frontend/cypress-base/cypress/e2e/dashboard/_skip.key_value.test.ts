import qs from 'querystringify';
import { waitForChartLoad } from 'cypress/utils';
import { WORLD_HEALTH_DASHBOARD } from 'cypress/utils/urls';
import { WORLD_HEALTH_CHARTS } from './utils';

interface QueryString {
  native_filters_key: string;
}

describe('nativefilter url param key', () => {
  // const urlParams = { param1: '123', param2: 'abc' };

  let initialFilterKey: string;
  it('should have cachekey in nativefilter param', () => {
    // things in `before` will not retry and the `waitForChartLoad` check is
    // especially flaky and may need more retries
    cy.visit(WORLD_HEALTH_DASHBOARD);
    WORLD_HEALTH_CHARTS.forEach(waitForChartLoad);
    cy.wait(1000); // wait for key to be published (debounced)
    cy.location().then(loc => {
      const queryParams = qs.parse(loc.search) as QueryString;
      expect(typeof queryParams.native_filters_key).eq('string');
    });
  });

  it('should have different key when page reloads', () => {
    cy.visit(WORLD_HEALTH_DASHBOARD);
    WORLD_HEALTH_CHARTS.forEach(waitForChartLoad);
    cy.wait(1000); // wait for key to be published (debounced)
    cy.location().then(loc => {
      const queryParams = qs.parse(loc.search) as QueryString;
      expect(queryParams.native_filters_key).not.equal(initialFilterKey);
    });
  });
});
