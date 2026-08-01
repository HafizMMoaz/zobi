import { type ReactNode } from 'react';
import { render, screen } from 'spec/helpers/testing-library';
import { logging } from '@zobi.dev/extension-api/utils';
import {
  Theme,
  normalizeThemeConfig,
  isThemeConfigDark,
} from '@zobi.dev/extension-api/theme';
import getBootstrapData from 'src/utils/getBootstrapData';
import CrudThemeProvider from './CrudThemeProvider';

jest.mock('@zobi.dev/extension-api/theme', () => ({
  ...jest.requireActual('@zobi.dev/extension-api/theme'),
  normalizeThemeConfig: jest.fn((config: unknown) => config),
  isThemeConfigDark: jest.fn(() => false),
}));

jest.mock('src/utils/getBootstrapData', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    common: { theme: { default: {}, dark: {} } },
  })),
}));

const mockGetBootstrapData = getBootstrapData as jest.MockedFunction<
  typeof getBootstrapData
>;
const mockNormalizeThemeConfig = normalizeThemeConfig as jest.MockedFunction<
  typeof normalizeThemeConfig
>;
const mockIsThemeConfigDark = isThemeConfigDark as jest.MockedFunction<
  typeof isThemeConfigDark
>;

type BootstrapData = ReturnType<typeof getBootstrapData>;
type BootstrapThemes = BootstrapData['common']['theme'];

function mockBootstrap(themes: Partial<BootstrapThemes> = {}): BootstrapData {
  return {
    common: {
      theme: { default: {}, dark: {}, ...themes },
    },
  } as unknown as BootstrapData;
}

const MockZobiThemeProvider = ({ children }: { children: ReactNode }) => (
  <div data-test="dashboard-theme-provider">{children}</div>
);

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(Theme, 'fromConfig').mockReturnValue({
    ZobiThemeProvider: MockZobiThemeProvider,
  } as unknown as Theme);
  mockNormalizeThemeConfig.mockImplementation(
    config => config as ReturnType<typeof normalizeThemeConfig>,
  );
  mockIsThemeConfigDark.mockReturnValue(false);
  mockGetBootstrapData.mockReturnValue(mockBootstrap());
  // Clean up font style elements from previous tests
  document
    .querySelectorAll('style[data-zobi-fonts]')
    .forEach(el => el.remove());
});

test('renders children directly when no theme is provided', () => {
  render(
    <CrudThemeProvider>
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );
  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  expect(
    screen.queryByTestId('dashboard-theme-provider'),
  ).not.toBeInTheDocument();
  expect(Theme.fromConfig).not.toHaveBeenCalled();
});

test('renders children directly when theme is null', () => {
  render(
    <CrudThemeProvider theme={null}>
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );
  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  expect(
    screen.queryByTestId('dashboard-theme-provider'),
  ).not.toBeInTheDocument();
  expect(Theme.fromConfig).not.toHaveBeenCalled();
});

test('wraps children with ZobiThemeProvider when valid theme data is provided', () => {
  const themeConfig = { token: { colorPrimary: '#ff0000' } };
  render(
    <CrudThemeProvider
      theme={{
        id: 1,
        theme_name: 'Custom Theme',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );
  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  expect(screen.getByTestId('dashboard-theme-provider')).toBeInTheDocument();
  expect(Theme.fromConfig).toHaveBeenCalledWith(themeConfig, expect.anything());
});

test('creates theme from inline json_data via Theme.fromConfig', () => {
  const themeConfig = { token: { colorPrimary: '#1677ff' } };
  render(
    <CrudThemeProvider
      theme={{
        id: 42,
        theme_name: 'Branded',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );
  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  // No API call can happen — CrudThemeProvider has no fetch/ZobiClient imports.
  // Theme is created synchronously from the inline json_data prop.
  expect(Theme.fromConfig).toHaveBeenCalledWith(themeConfig, expect.anything());
});

test('falls back to rendering children without theme wrapper when json_data is invalid JSON', () => {
  jest.spyOn(logging, 'warn').mockImplementation();
  render(
    <CrudThemeProvider
      theme={{ id: 1, theme_name: 'Bad Theme', json_data: 'not-valid-json' }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );
  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  expect(
    screen.queryByTestId('dashboard-theme-provider'),
  ).not.toBeInTheDocument();
  expect(logging.warn).toHaveBeenCalled();
});

test('falls back to rendering children without theme wrapper when Theme.fromConfig throws', () => {
  (Theme.fromConfig as jest.Mock).mockImplementation(() => {
    throw new Error('Invalid theme config');
  });
  jest.spyOn(logging, 'warn').mockImplementation();
  render(
    <CrudThemeProvider
      theme={{ id: 1, theme_name: 'Bad Theme', json_data: '{}' }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );
  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  expect(
    screen.queryByTestId('dashboard-theme-provider'),
  ).not.toBeInTheDocument();
  expect(logging.warn).toHaveBeenCalled();
});

test('merges dashboard theme with default base theme from bootstrap data', () => {
  const bootstrapDefault = { token: { colorPrimary: '#base-default' } };
  mockGetBootstrapData.mockReturnValue(
    mockBootstrap({ default: bootstrapDefault }),
  );
  mockIsThemeConfigDark.mockReturnValue(false);

  const themeConfig = { token: { colorPrimary: '#custom' } };
  render(
    <CrudThemeProvider
      theme={{
        id: 1,
        theme_name: 'Custom Theme',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );

  // Theme.fromConfig should be called with TWO args: normalized config + base theme
  expect(Theme.fromConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      token: expect.objectContaining({ colorPrimary: '#custom' }),
    }),
    bootstrapDefault,
  );
});

test('uses dark base theme when dashboard theme config is dark', () => {
  const bootstrapDark = {
    algorithm: 'dark',
    token: { colorPrimary: '#base-dark' },
  };
  mockGetBootstrapData.mockReturnValue(mockBootstrap({ dark: bootstrapDark }));
  mockIsThemeConfigDark.mockReturnValue(true);

  const themeConfig = {
    algorithm: 'dark',
    token: { colorPrimary: '#custom-dark' },
  };
  render(
    <CrudThemeProvider
      theme={{
        id: 1,
        theme_name: 'Dark Theme',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );

  expect(Theme.fromConfig).toHaveBeenCalledWith(themeConfig, bootstrapDark);
});

test('injects font URLs as CSS @import rules', () => {
  const fontUrl = 'https://fonts.example.com/custom.css';
  const themeConfig = {
    token: { colorPrimary: '#ff0000', fontUrls: [fontUrl] },
  };
  render(
    <CrudThemeProvider
      theme={{
        id: 1,
        theme_name: 'Font Theme',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );

  const fontStyle = document.querySelector('style[data-zobi-fonts]');
  expect(fontStyle).not.toBeNull();
  expect(fontStyle?.textContent).toContain(`@import url("${fontUrl}")`);
});

test('does not inject fonts when Theme.fromConfig throws even if fontUrls are present', () => {
  (Theme.fromConfig as jest.Mock).mockImplementation(() => {
    throw new Error('Invalid theme config');
  });
  jest.spyOn(logging, 'warn').mockImplementation();
  const themeConfig = {
    token: {
      colorPrimary: '#ff0000',
      fontUrls: ['https://fonts.example.com/custom.css'],
    },
  };
  render(
    <CrudThemeProvider
      theme={{
        id: 1,
        theme_name: 'Bad Theme With Fonts',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );

  const fontStyle = document.querySelector('style[data-zobi-fonts]');
  expect(fontStyle).toBeNull();
  expect(logging.warn).toHaveBeenCalled();
});

test('ignores non-array fontUrls in theme config without throwing', () => {
  const themeConfig = {
    token: { colorPrimary: '#ff0000', fontUrls: 'not-an-array' },
  };
  render(
    <CrudThemeProvider
      theme={{
        id: 1,
        theme_name: 'Malformed Fonts',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );

  expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  expect(screen.getByTestId('dashboard-theme-provider')).toBeInTheDocument();
  const fontStyle = document.querySelector('style[data-zobi-fonts]');
  expect(fontStyle).toBeNull();
});

test('does not inject font style element when no fontUrls in config', () => {
  const themeConfig = { token: { colorPrimary: '#ff0000' } };
  render(
    <CrudThemeProvider
      theme={{
        id: 1,
        theme_name: 'No Fonts',
        json_data: JSON.stringify(themeConfig),
      }}
    >
      <div>Dashboard Content</div>
    </CrudThemeProvider>,
  );

  const fontStyle = document.querySelector('style[data-zobi-fonts]');
  expect(fontStyle).toBeNull();
});
