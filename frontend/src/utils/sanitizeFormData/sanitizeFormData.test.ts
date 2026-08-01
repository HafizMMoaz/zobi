import { sanitizeFormData } from '.';

test('sanitizeFormData removes temporary control values', () => {
  expect(
    sanitizeFormData({
      url_params: { foo: 'bar' },
      metrics: ['foo', 'bar'],
    }),
  ).toEqual({ metrics: ['foo', 'bar'] });
});
