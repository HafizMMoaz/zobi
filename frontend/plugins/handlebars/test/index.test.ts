import { HandlebarsChartPlugin } from '../src';

/**
 * The example tests in this file act as a starting point, and
 * we encourage you to build more. These tests check that the
 * plugin loads properly, and focus on `transformProps`
 * to ake sure that data, controls, and props are all
 * treated correctly (e.g. formData from plugin controls
 * properly transform the data and/or any resulting props).
 */
describe('@zobi.dev/handlebars', () => {
  test('exists', () => {
    expect(HandlebarsChartPlugin).toBeDefined();
  });
});
