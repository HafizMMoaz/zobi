import { isValidElement } from 'react';
import type { QueryState } from '@zobi-ui/core';
import { render } from 'spec/helpers/testing-library';
import QueryStateLabel from '.';

jest.mock('@zobi-ui/core/components/Label', () => ({
  __esModule: true,
  Label: () => <div data-test="mock-label" />,
}));

const mockedProps = {
  query: {
    state: 'running' as QueryState,
  },
};
test('is valid', () => {
  expect(isValidElement(<QueryStateLabel {...mockedProps} />)).toBe(true);
});
test('has an Overlay and a Popover', () => {
  const { getByTestId } = render(<QueryStateLabel {...mockedProps} />);
  expect(getByTestId('mock-label')).toBeInTheDocument();
});
