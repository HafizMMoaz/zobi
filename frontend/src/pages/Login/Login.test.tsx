import { render, screen } from 'spec/helpers/testing-library';
import getBootstrapData from 'src/utils/getBootstrapData';
import Login from './index';

const defaultBootstrapData = {
  common: {
    conf: {
      AUTH_TYPE: 1,
      AUTH_PROVIDERS: [],
      AUTH_USER_REGISTRATION: false,
    },
    feature_flags: {},
  },
};

jest.mock('src/utils/getBootstrapData', () => ({
  __esModule: true,
  default: jest.fn(() => defaultBootstrapData),
}));

const mockGetBootstrapData = getBootstrapData as jest.Mock;

beforeEach(() => {
  mockGetBootstrapData.mockReturnValue(defaultBootstrapData);
});

test('should render login form elements', () => {
  render(<Login />, { useRedux: true });
  expect(screen.getByTestId('login-form')).toBeInTheDocument();
  expect(screen.getByTestId('username-input')).toBeInTheDocument();
  expect(screen.getByTestId('password-input')).toBeInTheDocument();
  expect(screen.getByTestId('login-button')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
});

test('should render username and password labels', () => {
  render(<Login />, { useRedux: true });
  expect(screen.getByText('Username:')).toBeInTheDocument();
  expect(screen.getByText('Password:')).toBeInTheDocument();
});

test('should render form instruction text', () => {
  render(<Login />, { useRedux: true });
  expect(
    screen.getByText('Enter your login and password below:'),
  ).toBeInTheDocument();
});

test('should render SAML provider buttons', () => {
  mockGetBootstrapData.mockReturnValue({
    common: {
      conf: {
        AUTH_TYPE: 5,
        AUTH_PROVIDERS: [
          { name: 'okta', icon: 'okta' },
          { name: 'onelogin', icon: 'onelogin' },
        ],
        AUTH_USER_REGISTRATION: false,
      },
    },
  });
  render(<Login />, { useRedux: true });
  expect(screen.getByText('Sign in with Okta')).toBeInTheDocument();
  expect(screen.getByText('Sign in with Onelogin')).toBeInTheDocument();
});
