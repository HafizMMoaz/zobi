
import { render, screen } from 'spec/helpers/testing-library';
import { ErrorLevel } from '@zobi-ui/core';
import { zobiTheme } from '@zobi/core/theme';
import { BasicErrorAlert } from './BasicErrorAlert';

jest.mock(
  '@zobi-ui/core/components/Icons/AsyncIcon',
  () =>
    ({ fileName }: { fileName: string }) => (
      <span role="img" aria-label={fileName.replace('_', '-')} />
    ),
);

const mockedProps = {
  body: 'Error body',
  level: 'warning' as ErrorLevel,
  title: 'Error title',
};

test('should render', () => {
  const { container } = render(<BasicErrorAlert {...mockedProps} />);
  expect(container).toBeInTheDocument();
});

test('should render warning icon', () => {
  render(<BasicErrorAlert {...mockedProps} />);
  expect(
    screen.getByRole('img', { name: 'exclamation-circle' }),
  ).toBeInTheDocument();
});

test('should render error icon', () => {
  const errorProps = {
    ...mockedProps,
    level: 'error' as ErrorLevel,
  };
  render(<BasicErrorAlert {...errorProps} />);
  expect(
    screen.getByRole('img', { name: 'exclamation-circle' }),
  ).toBeInTheDocument();
});

test('should render the error title', () => {
  render(<BasicErrorAlert {...mockedProps} />);
  expect(screen.getByText('Error title')).toBeInTheDocument();
});

test('should render the error body', () => {
  render(<BasicErrorAlert {...mockedProps} />);
  expect(screen.getByText('Error body')).toBeInTheDocument();
});

test('should render with warning theme', () => {
  render(<BasicErrorAlert {...mockedProps} />);
  expect(screen.getByRole('alert')).toHaveStyle(
    `
      color: ${zobiTheme.colorWarningText};
    `,
  );
});

test('should render with error theme', () => {
  const errorProps = {
    ...mockedProps,
    level: 'error' as ErrorLevel,
  };
  render(<BasicErrorAlert {...errorProps} />);
  expect(screen.getByRole('alert')).toHaveStyle(
    `
      color: ${zobiTheme.colorErrorText};
    `,
  );
});
