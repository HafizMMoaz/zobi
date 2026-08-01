import { ReactElement } from 'react';
import { render, screen } from 'spec/helpers/testing-library';
import type { ErrorBoundaryProps } from './types';
import { ErrorBoundary } from '.';

const mockedProps: Partial<ErrorBoundaryProps> = {
  children: <span>Error children</span>,
  onError: jest.fn(),
  showMessage: false,
};

const Child = (): ReactElement => {
  throw new Error('Thrown error');
};

test('should render', () => {
  const { container } = render(
    <ErrorBoundary {...mockedProps}>
      <Child />
    </ErrorBoundary>,
  );
  expect(container).toBeInTheDocument();
});

test('should not render an error message', () => {
  render(
    <ErrorBoundary {...mockedProps}>
      <Child />
    </ErrorBoundary>,
  );
  expect(screen.queryByText('Unexpected error')).not.toBeInTheDocument();
});

test('should render an error message', () => {
  const messageProps = {
    ...mockedProps,
    showMessage: true,
  };
  render(
    <ErrorBoundary {...messageProps}>
      <Child />
    </ErrorBoundary>,
  );
  expect(screen.getByText('Unexpected error')).toBeInTheDocument();
});
