import { sections } from '../src';

describe('@zobi.dev/chart-controls', () => {
  test('exports sections', () => {
    expect(sections).toBeDefined();
    expect(sections.datasourceAndVizType).toBeDefined();
  });
});
