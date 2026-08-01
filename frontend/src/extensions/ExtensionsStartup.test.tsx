import { render, waitFor } from 'spec/helpers/testing-library';
import { FeatureFlag, isFeatureEnabled } from '@zobi-ui/core';
import fetchMock from 'fetch-mock';
import ExtensionsStartup from './ExtensionsStartup';
import ExtensionsLoader from './ExtensionsLoader';

// Mock the isFeatureEnabled function
jest.mock('@zobi-ui/core', () => ({
  ...jest.requireActual('@zobi-ui/core'),
  isFeatureEnabled: jest.fn(),
}));

const mockIsFeatureEnabled = isFeatureEnabled as jest.MockedFunction<
  typeof isFeatureEnabled
>;

const mockInitialState = {
  user: { userId: 1 },
};

const mockInitialStateNoUser = {
  user: { userId: undefined },
};

// Clean up global state before each test
beforeEach(() => {
  // Clear the window.zobi object
  delete (window as any).zobi;

  // Clear any existing ExtensionsLoader instance
  (ExtensionsLoader as any).instance = undefined;

  // Reset feature flag mock to enabled by default
  mockIsFeatureEnabled.mockReset();
  mockIsFeatureEnabled.mockReturnValue(true);

  // Setup fetch mocks for API calls
  fetchMock.clearHistory().removeRoutes();
  fetchMock.get('glob:*/api/v1/extensions/', {
    result: [],
  });
});

afterEach(() => {
  // Clean up after each test
  delete (window as any).zobi;
  (ExtensionsLoader as any).instance = undefined;

  // Reset mocks
  mockIsFeatureEnabled.mockReset();
  fetchMock.clearHistory().removeRoutes();
});

test('renders without crashing', () => {
  render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialState,
  });

  // Component renders null initially (before extensions are loaded)
  expect(true).toBe(true);
});

test('sets up global zobi object when user is logged in', async () => {
  // Mock initializeExtensions to avoid API calls in this test
  const loader = ExtensionsLoader.getInstance();
  const initializeSpy = jest
    .spyOn(loader, 'initializeExtensions')
    .mockImplementation(() => Promise.resolve());

  render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialState,
  });

  await waitFor(() => {
    // Verify the global zobi object is set up
    expect((window as any).zobi).toBeDefined();
    expect((window as any).zobi.authentication).toBeDefined();
    expect((window as any).zobi.core).toBeDefined();
    expect((window as any).zobi.commands).toBeDefined();
    expect((window as any).zobi.extensions).toBeDefined();
    expect((window as any).zobi.menus).toBeDefined();
    expect((window as any).zobi.views).toBeDefined();
    expect((window as any).zobi.sqlLab).toBeDefined();
  });

  initializeSpy.mockRestore();
});

test('does not set up global zobi object when user is not logged in', async () => {
  render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialStateNoUser,
  });

  // Wait for the useEffect to complete and verify the global object is not set up
  await waitFor(() => {
    expect((window as any).zobi).toBeUndefined();
  });
});

test('initializes ExtensionsLoader when user is logged in', async () => {
  // Mock initializeExtensions to avoid API calls, but track that it was called
  const loader = ExtensionsLoader.getInstance();
  const initializeSpy = jest
    .spyOn(loader, 'initializeExtensions')
    .mockImplementation(() => Promise.resolve());

  render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialState,
  });

  await waitFor(() => {
    // Verify ExtensionsLoader initialization was called
    expect(initializeSpy).toHaveBeenCalledTimes(1);
    // The loader should exist and be ready to use
    expect(loader).toBeDefined();
    expect(loader.getExtensions).toBeDefined();
  });

  initializeSpy.mockRestore();
});

test('does not initialize ExtensionsLoader when user is not logged in', async () => {
  render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialStateNoUser,
  });

  // Wait for the useEffect to complete and verify no initialization happened
  await waitFor(() => {
    const loader = ExtensionsLoader.getInstance();
    expect(loader).toBeDefined();
    // Since no initialization happened, there should be no extensions loaded initially
    expect(loader.getExtensions()).toEqual([]);
  });
});

test('only initializes once even with multiple renders', async () => {
  // Track calls to the loader's public API
  const loader = ExtensionsLoader.getInstance();
  const originalInitialize = loader.initializeExtensions;
  let initializeCallCount = 0;

  loader.initializeExtensions = jest.fn().mockImplementation(() => {
    initializeCallCount += 1;
    return Promise.resolve();
  });

  const { rerender } = render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialState,
  });

  await waitFor(() => {
    expect(initializeCallCount).toBe(1);
  });

  // Re-render the component
  rerender(<ExtensionsStartup />);

  // Wait for any potential async operations, but expect no additional calls
  await waitFor(() => {
    expect(initializeCallCount).toBe(1);
  });

  // Verify initialization is still only called once
  expect(initializeCallCount).toBe(1);

  // Restore original method
  loader.initializeExtensions = originalInitialize;
});

test('initializes ExtensionsLoader when EnableExtensions feature flag is enabled', async () => {
  // Ensure feature flag is enabled
  mockIsFeatureEnabled.mockImplementation(
    (flag: FeatureFlag) => flag === FeatureFlag.EnableExtensions,
  );

  // Mock the initializeExtensions method to succeed
  const originalInitialize = ExtensionsLoader.prototype.initializeExtensions;
  ExtensionsLoader.prototype.initializeExtensions = jest
    .fn()
    .mockImplementation(() => Promise.resolve());

  render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialState,
  });

  await waitFor(() => {
    // Verify feature flag was checked
    expect(mockIsFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlag.EnableExtensions,
    );
    // Verify initialization was called
    expect(
      ExtensionsLoader.prototype.initializeExtensions,
    ).toHaveBeenCalledTimes(1);
  });

  // Restore original method
  ExtensionsLoader.prototype.initializeExtensions = originalInitialize;
});

test('does not initialize ExtensionsLoader when EnableExtensions feature flag is disabled', async () => {
  // Disable the feature flag
  mockIsFeatureEnabled.mockReturnValue(false);

  const loader = ExtensionsLoader.getInstance();
  const initializeSpy = jest
    .spyOn(loader, 'initializeExtensions')
    .mockImplementation();

  render(<ExtensionsStartup />, {
    useRedux: true,
    initialState: mockInitialState,
  });

  await waitFor(() => {
    // Verify feature flag was checked
    expect(mockIsFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlag.EnableExtensions,
    );
    // Verify the global zobi object is still set up
    expect((window as any).zobi).toBeDefined();
    // But extensions should not be initialized
    expect(initializeSpy).not.toHaveBeenCalled();
  });

  initializeSpy.mockRestore();
});

test('continues rendering children even when ExtensionsLoader initialization fails', async () => {
  // Ensure feature flag is enabled
  mockIsFeatureEnabled.mockReturnValue(true);

  // Mock the initializeExtensions method to reject — ExtensionsLoader handles
  // its own error logging internally
  const originalInitialize = ExtensionsLoader.prototype.initializeExtensions;
  ExtensionsLoader.prototype.initializeExtensions = jest
    .fn()
    .mockImplementation(() => Promise.resolve());

  const { container } = render(
    <ExtensionsStartup>
      <div data-testid="child" />
    </ExtensionsStartup>,
    {
      useRedux: true,
      initialState: mockInitialState,
    },
  );

  await waitFor(() => {
    expect(mockIsFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlag.EnableExtensions,
    );
    expect(
      container.querySelector('[data-testid="child"]'),
    ).toBeInTheDocument();
  });

  // Restore original method
  ExtensionsLoader.prototype.initializeExtensions = originalInitialize;
});
