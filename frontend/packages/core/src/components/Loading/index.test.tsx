
import { render, screen } from '@zobi.dev/core/spec';
import * as themeModule from '@zobi.dev/extension-api/theme';
import { Loading } from '.';

// Mock the loading SVG import since it's a file stub in tests
jest.mock('../assets', () => ({
  Loading: () => <svg data-test="default-loading-svg" />,
}));

const mockUseTheme = jest.fn();

beforeEach(() => {
  mockUseTheme.mockReset();
  jest.spyOn(themeModule, 'useTheme').mockImplementation(mockUseTheme);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('uses default spinner when no theme spinner configured', () => {
  mockUseTheme.mockReturnValue({});

  render(<Loading />);
  const loading = screen.getByRole('status');
  expect(loading).toBeInTheDocument();
  // Now renders SVG component instead of img with src
  expect(
    loading.querySelector('[data-test="default-loading-svg"]'),
  ).toBeInTheDocument();
});

test('uses brandSpinnerUrl from theme when configured', () => {
  mockUseTheme.mockReturnValue({
    brandSpinnerUrl: '/custom/spinner.png',
  });

  render(<Loading />);
  const loading = screen.getByRole('status');
  expect(loading).toBeInTheDocument();
  const img = loading.querySelector('img');
  expect(img).toHaveAttribute('src', '/custom/spinner.png');
});

test('uses brandSpinnerSvg from theme when configured', () => {
  const svgContent = '<svg><circle cx="25" cy="25" r="20"/></svg>';
  mockUseTheme.mockReturnValue({
    brandSpinnerSvg: svgContent,
  });

  render(<Loading />);
  const loading = screen.getByRole('status');
  expect(loading).toBeInTheDocument();
  const img = loading.querySelector('img');
  const src = img?.getAttribute('src');
  expect(src).toContain('data:image/svg+xml;base64,');
  expect(atob(src!.split(',')[1])).toBe(svgContent);
});

test('brandSpinnerSvg takes precedence over brandSpinnerUrl', () => {
  const svgContent = '<svg><circle cx="25" cy="25" r="20"/></svg>';
  mockUseTheme.mockReturnValue({
    brandSpinnerUrl: '/custom/spinner.png',
    brandSpinnerSvg: svgContent,
  });

  render(<Loading />);
  const loading = screen.getByRole('status');
  expect(loading).toBeInTheDocument();
  const img = loading.querySelector('img');
  const src = img?.getAttribute('src');
  expect(src).toContain('data:image/svg+xml;base64,');
  expect(src).not.toBe('/custom/spinner.png');
});

test('explicit image prop takes precedence over theme spinners', () => {
  const svgContent = '<svg><circle cx="25" cy="25" r="20"/></svg>';
  mockUseTheme.mockReturnValue({
    brandSpinnerUrl: '/custom/spinner.png',
    brandSpinnerSvg: svgContent,
  });

  render(<Loading image="/explicit/spinner.gif" />);
  const loading = screen.getByRole('status');
  expect(loading).toBeInTheDocument();
  const img = loading.querySelector('img');
  expect(img).toHaveAttribute('src', '/explicit/spinner.gif');
});
