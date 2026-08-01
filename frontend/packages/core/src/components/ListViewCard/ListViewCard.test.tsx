import fetchMock from 'fetch-mock';

import { render, screen } from '@zobi.dev/core/spec';
import { ListViewCard } from '.';

global.URL.createObjectURL = jest.fn(() => '/local_url');
fetchMock.get('/thumbnail', { body: new Blob(), sendAsJson: false });

describe('ListViewCard', () => {
  const defaultProps = {
    title: 'Card Title',
    loading: false,
    url: '/card-url',
    imgURL: '/thumbnail',
    imgFallbackURL: '/fallback',
    description: 'Card Description',
    coverLeft: 'Left Text',
    coverRight: 'Right Text',
    actions: (
      <ListViewCard.Actions>
        <div>Action 1</div>
        <div>Action 2</div>
      </ListViewCard.Actions>
    ),
  };

  beforeEach(() => {
    const props = { ...defaultProps };
    render(<ListViewCard {...props} />);
  });

  test('is a valid element', () => {
    expect(screen.getByTestId('styled-card')).toBeInTheDocument();
  });

  test('renders Actions', () => {
    expect(screen.getByTestId('card-actions')).toBeVisible();
    expect(screen.getByText('Action 1')).toBeVisible();
    expect(screen.getByText('Action 2')).toBeVisible();
  });

  test('renders an ImageLoader', () => {
    expect(screen.getByTestId('image-loader')).toBeVisible();
  });
});
