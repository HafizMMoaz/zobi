// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />
type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;
type JSONObject = { [member: string]: JSONValue };
type JSONArray = JSONValue[];

declare namespace Cypress {
  interface Chainable {
    /**
     * Login test user.
     */
    login(): void;

    /**
     *
     * Utils
     */

    getBySel(selector: string): cy;
    getBySelLike(selector: string): cy;
    cleanCharts(): cy;
    cleanDashboards(): cy;
    loadChartFixtures(): cy;
    loadDashboardFixtures(): cy;
    allowConsoleErrors(consoleMessages: (string | RegExp)[]): cy;

    visitChartByParams(params: string | Record<string, unknown>): cy;
    visitChartByName(name: string): cy;
    visitChartById(id: number): cy;

    /**
     * Verify slice container renders.
     */
    verifySliceContainer(chartSelector: JQuery.Selector): cy;

    /**
     * Verify slice successfully loaded.
     */
    verifySliceSuccess(options: {
      waitAlias: string;
      querySubstring?: string | RegExp;
      chartSelector?: JQuery.Selector;
    }): cy;

    /**
     * Get
     */
    getDashboards(): cy;
    getDashboard(dashboardId: string | number): Record<string, any>;
    getCharts(): cy;

    /**
     * Create
     */
    createSampleDashboards(indexes?: number[]): void;
    createSampleCharts(indexes?: number[]): void;

    /**
     * Delete
     */
    deleteDashboard(id: number, failOnStatusCode: boolean): cy;
    deleteDashboardByName(dashboardName: string, failOnStatusCode: boolean): cy;
    deleteChartByName(name: string, failOnStatusCode: boolean): cy;
    deleteChart(id: number, failOnStatusCode: boolean): cy;

    /**
     * Update
     */
    updateDashboard(dashboardId: number, body: Record<string, any>): cy;
  }
}

declare module '@cypress/code-coverage/task';
