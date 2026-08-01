import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import { FilterBarOrientation } from 'src/dashboard/types';
import CrossFilterTitle from './CrossFilterTitle';

const mockedProps = {
  title: 'test-title',
  orientation: FilterBarOrientation.Horizontal,
  onHighlightFilterSource: jest.fn(),
};

const setup = (props: typeof mockedProps) =>
  render(<CrossFilterTitle {...props} />, {
    useRedux: true,
  });

// Add cleanup
afterEach(async () => {
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

test('CrossFilterTitle should render', async () => {
  const { container } = setup(mockedProps);
  await waitFor(() => {
    expect(container).toBeInTheDocument();
  });
});

test('Title should be visible', async () => {
  setup(mockedProps);
  await waitFor(() => {
    expect(screen.getByText('test-title')).toBeInTheDocument();
  });
});

test('Search icon should highlight emitter', async () => {
  setup(mockedProps);
  await waitFor(() => {
    const search = screen.getByTestId('cross-filters-highlight-emitter');
    expect(search).toBeInTheDocument();
  });

  const search = screen.getByTestId('cross-filters-highlight-emitter');
  await userEvent.click(search);

  await waitFor(() => {
    expect(mockedProps.onHighlightFilterSource).toHaveBeenCalled();
  });
});
