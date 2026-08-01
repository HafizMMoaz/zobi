import ViewportControl from 'src/explore/components/controls/ViewportControl';
import { render, screen, userEvent } from 'spec/helpers/testing-library';

const defaultProps = {
  value: {
    longitude: 6.85236157047845,
    latitude: 31.222656842808707,
    zoom: 1,
    bearing: 0,
    pitch: 0,
  },
  name: 'foo',
  label: 'bar',
};
const renderedCoordinate = '6° 51\' 08.5017" | 31° 13\' 21.5646"';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('ViewportControl', () => {
  beforeEach(() => {
    render(<ViewportControl {...defaultProps} />);
  });

  test('renders a OverlayTrigger if clicked', () => {
    expect(screen.getByTestId('foo-header')).toBeInTheDocument(); // Presence of ControlHeader
    userEvent.click(screen.getByText(renderedCoordinate));
    expect(screen.getByText('Viewport')).toBeInTheDocument(); // Presence of Popover
  });

  test('renders a Popover with 5 TextControl if clicked', () => {
    userEvent.click(screen.getByText(renderedCoordinate));
    expect(screen.queryAllByTestId('inline-name')).toHaveLength(5);
  });

  test('renders a summary in the label', () => {
    expect(screen.getByText(renderedCoordinate)).toBeInTheDocument();
  });
});
