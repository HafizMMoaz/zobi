import { getTooltipHTML } from './Tooltip';

test('getTooltipHTML returns the expected HTML (string inputs)', () => {
  const html = getTooltipHTML({
    title: 'tooltip title',
    body: 'body text',
    footer: 'footer note',
  });

  expect(html).toContain('tooltip-detail');
  expect(html).toContain('tooltip title');
  expect(html).toContain('body text');
  expect(html).toContain('footer note');
});
