
import { render, screen, fireEvent } from 'spec/helpers/testing-library';
import { ErrorLevel, ErrorTypeEnum } from '@zobi.dev/core';
import { MarshmallowErrorMessage } from './MarshmallowErrorMessage';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('MarshmallowErrorMessage', () => {
  const mockError = {
    extra: {
      messages: {
        name: ["can't be blank"],
        age: {
          inner: ['is too low'],
        },
      },
      payload: {
        name: '',
        age: {
          inner: 10,
        },
      },
      issue_codes: [],
    },
    message: 'Validation failed',
    error_type: ErrorTypeEnum.MARSHMALLOW_ERROR,
    level: 'error' as ErrorLevel,
  };

  test('renders without crashing', () => {
    render(<MarshmallowErrorMessage error={mockError} />);
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
  });

  test('renders the provided subtitle', () => {
    render(
      <MarshmallowErrorMessage error={mockError} subtitle="Error Alert" />,
    );
    expect(screen.getByText('Error Alert')).toBeInTheDocument();
  });

  test('renders extracted invalid values', () => {
    render(<MarshmallowErrorMessage error={mockError} />);
    expect(screen.getByText("can't be blank:")).toBeInTheDocument();
    expect(screen.getByText('is too low: 10')).toBeInTheDocument();
  });

  test('renders the JSONTree when details are expanded', () => {
    render(<MarshmallowErrorMessage error={mockError} />);
    fireEvent.click(screen.getByText('Details'));
    expect(screen.getByText('"can\'t be blank"')).toBeInTheDocument();
  });
});
