
import { render, screen } from '@zobi.dev/core/spec';
import { Loading } from '.';

test('Rerendering correctly with default props', () => {
  render(<Loading />);
  const loading = screen.getByRole('status');
  const classNames = loading.getAttribute('class')?.split(' ');
  const ariaLive = loading.getAttribute('aria-live');
  const ariaLabel = loading.getAttribute('aria-label');
  expect(loading).toBeInTheDocument();
  expect(classNames).toContain('floating');
  expect(classNames).toContain('loading');
  expect(ariaLive).toContain('polite');
  expect(ariaLabel).toContain('Loading');
});

test('Position must be a class', () => {
  render(<Loading position="normal" />);
  const loading = screen.getByRole('status');
  const classNames = loading.getAttribute('class')?.split(' ');
  expect(loading).toBeInTheDocument();
  expect(classNames).not.toContain('floating');
  expect(classNames).toContain('normal');
});

test('support for extra classes', () => {
  render(<Loading className="extra-class" />);
  const loading = screen.getByRole('status');
  const classNames = loading.getAttribute('class')?.split(' ');
  expect(loading).toBeInTheDocument();
  expect(classNames).toContain('loading');
  expect(classNames).toContain('floating');
  expect(classNames).toContain('extra-class');
});

test('Different image path', () => {
  render(<Loading image="/src/assets/images/loading.gif" />);
  const loading = screen.getByRole('status');
  const image = loading.querySelector('img');
  const imagePath = image?.getAttribute('src');
  expect(loading).toBeInTheDocument();
  expect(imagePath).toBe('/src/assets/images/loading.gif');
});
