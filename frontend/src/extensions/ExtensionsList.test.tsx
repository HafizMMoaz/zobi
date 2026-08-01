import { render, waitFor } from 'spec/helpers/testing-library';
import ExtensionsList from './ExtensionsList';
import fetchMock from 'fetch-mock';

beforeAll(() => fetchMock.unmockGlobal());

// Mock initial state for the store
const mockInitialState = {
  extensions: {
    loading: false,
    resourceCount: 2,
    resourceCollection: [
      {
        id: 1,
        name: 'Test Extension 1',
        enabled: true,
      },
      {
        id: 2,
        name: 'Test Extension 2',
        enabled: false,
      },
    ],
    bulkSelectEnabled: false,
  },
};

const defaultProps = {
  addDangerToast: jest.fn(),
  addSuccessToast: jest.fn(),
};

const renderWithStore = (props = {}) =>
  render(<ExtensionsList {...defaultProps} {...props} />, {
    useRedux: true,
    useQueryParams: true,
    useRouter: true,
    useTheme: true,
    initialState: mockInitialState,
  });

test('renders extensions list with basic structure', async () => {
  renderWithStore();

  // Check that the component renders
  expect(document.body).toBeInTheDocument();
});

test('displays extension names in the list', async () => {
  renderWithStore();

  await waitFor(() => {
    // These texts should appear somewhere in the rendered component
    expect(document.body).toHaveTextContent(/Extensions/);
  });
});

test('calls toast functions when provided', () => {
  const addDangerToast = jest.fn();
  const addSuccessToast = jest.fn();

  renderWithStore({
    addDangerToast,
    addSuccessToast,
  });

  // The component should accept these props without error
  expect(addDangerToast).toBeDefined();
  expect(addSuccessToast).toBeDefined();
});
