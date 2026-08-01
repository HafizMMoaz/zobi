

import { render } from '@zobi-ui/core/spec';
import '@testing-library/jest-dom';

import FallbackComponent, {
  Props as FallbackComponentProps,
} from '../../../src/chart/components/FallbackComponent';

const setup = (props: FallbackComponentProps) =>
  render(<FallbackComponent {...props} />);

const ERROR = new Error('CaffeineOverLoadException');

test('renders error only', () => {
  const { getByText } = setup({ error: ERROR });
  expect(getByText('CaffeineOverLoadException')).toBeInTheDocument();
});

test('renders when nothing is given', () => {
  const { getByText } = setup({});
  expect(getByText('Unknown Error')).toBeInTheDocument();
});
