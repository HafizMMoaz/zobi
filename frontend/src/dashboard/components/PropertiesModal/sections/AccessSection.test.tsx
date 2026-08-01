import { render, screen } from 'spec/helpers/testing-library';
import { isFeatureEnabled, FeatureFlag } from '@zobi.dev/core';
import AccessSection from './AccessSection';

// Mock feature flags
jest.mock('@zobi.dev/core', () => ({
  ...jest.requireActual('@zobi.dev/core'),
  isFeatureEnabled: jest.fn(),
}));

// Mock the hooks
jest.mock('../hooks/useAccessOptions', () => ({
  useAccessOptions: () => ({
    loadAccessOptions: jest.fn(),
  }),
}));

// Mock tags utils
jest.mock('src/components/Tag/utils', () => ({
  loadTags: jest.fn(),
}));

const mockedIsFeatureEnabled = isFeatureEnabled as jest.Mock;

const defaultProps = {
  isLoading: false,
  owners: [{ id: 1, full_name: 'John Doe' }],
  roles: [{ id: 1, name: 'Admin' }],
  tags: [{ id: 1, name: 'Important' }],
  onChangeOwners: jest.fn(),
  onChangeRoles: jest.fn(),
  onChangeTags: jest.fn(),
  onClearTags: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('always renders owners field', () => {
  mockedIsFeatureEnabled.mockReturnValue(false);

  render(<AccessSection {...defaultProps} />);

  expect(screen.getByTestId('dashboard-owners-field')).toBeInTheDocument();
});

test('renders roles field when DashboardRbac feature is enabled', () => {
  mockedIsFeatureEnabled.mockImplementation(
    (flag: any) => flag === FeatureFlag.DashboardRbac,
  );

  render(<AccessSection {...defaultProps} />);

  expect(screen.getByTestId('dashboard-roles-field')).toBeInTheDocument();
});

test('does not render roles field when DashboardRbac feature is disabled', () => {
  mockedIsFeatureEnabled.mockReturnValue(false);

  render(<AccessSection {...defaultProps} />);

  expect(screen.queryByTestId('dashboard-roles-field')).not.toBeInTheDocument();
});

test('renders tags field when TaggingSystem feature is enabled', () => {
  mockedIsFeatureEnabled.mockImplementation(
    (flag: any) => flag === FeatureFlag.TaggingSystem,
  );

  render(<AccessSection {...defaultProps} />);

  expect(screen.getByTestId('dashboard-tags-field')).toBeInTheDocument();
});

test('does not render tags field when TaggingSystem feature is disabled', () => {
  mockedIsFeatureEnabled.mockReturnValue(false);

  render(<AccessSection {...defaultProps} />);

  expect(screen.queryByTestId('dashboard-tags-field')).not.toBeInTheDocument();
});

test('renders all fields when both features are enabled', () => {
  mockedIsFeatureEnabled.mockReturnValue(true);

  render(<AccessSection {...defaultProps} />);

  expect(screen.getByTestId('dashboard-owners-field')).toBeInTheDocument();
  expect(screen.getByTestId('dashboard-roles-field')).toBeInTheDocument();
  expect(screen.getByTestId('dashboard-tags-field')).toBeInTheDocument();
});

test('disables inputs when loading', () => {
  mockedIsFeatureEnabled.mockReturnValue(true);

  render(<AccessSection {...defaultProps} isLoading />);

  // AsyncSelect components should be disabled when loading
  expect(screen.getByTestId('dashboard-owners-field')).toBeInTheDocument();
});

test('shows helper text for each field', () => {
  mockedIsFeatureEnabled.mockReturnValue(true);

  render(<AccessSection {...defaultProps} />);

  expect(screen.getByText(/Owners is a list of users/)).toBeInTheDocument();
  expect(
    screen.getByText(/Roles is a list which defines access/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/A list of tags that have been applied/),
  ).toBeInTheDocument();
});
