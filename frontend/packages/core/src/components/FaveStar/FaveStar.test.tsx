
import { render, screen, userEvent } from '@zobi.dev/core/spec';
import { FaveStar } from '.';

jest.mock('@zobi.dev/core/components/Tooltip', () => ({
  Tooltip: (props: any) => <div data-test="tooltip" {...props} />,
}));

test('render right content', async () => {
  const props = {
    itemId: 3,
    saveFaveStar: jest.fn(),
  };

  const { rerender, findByRole } = render(<FaveStar {...props} isStarred />);
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'starred' })).toBeInTheDocument();

  expect(props.saveFaveStar).toHaveBeenCalledTimes(0);
  await userEvent.click(screen.getByRole('button'));
  expect(props.saveFaveStar).toHaveBeenCalledTimes(1);
  expect(props.saveFaveStar).toHaveBeenCalledWith(props.itemId, true);

  rerender(<FaveStar {...props} />);
  expect(await findByRole('img', { name: 'unstarred' })).toBeInTheDocument();

  expect(props.saveFaveStar).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole('button'));
  expect(props.saveFaveStar).toHaveBeenCalledTimes(2);
  expect(props.saveFaveStar).toHaveBeenCalledWith(props.itemId, false);
});

test('render content on tooltip', async () => {
  const props = {
    itemId: 3,
    showTooltip: true,
    saveFaveStar: jest.fn(),
  };

  render(<FaveStar {...props} />);

  expect(await screen.findByTestId('tooltip')).toBeInTheDocument();
  expect(screen.getByTestId('tooltip')).toHaveAttribute(
    'id',
    'fave-unfave-tooltip',
  );
  expect(screen.getByTestId('tooltip')).toHaveAttribute(
    'title',
    'Click to favorite/unfavorite',
  );
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('Call fetchFaveStar on first render and on itemId change', async () => {
  const props = {
    itemId: 3,
    fetchFaveStar: jest.fn(),
    saveFaveStar: jest.fn(),
    isStarred: false,
    showTooltip: false,
  };

  const { rerender, findByRole } = render(<FaveStar {...props} />);
  expect(await findByRole('img', { name: 'unstarred' })).toBeInTheDocument();
  expect(props.fetchFaveStar).toHaveBeenCalledTimes(1);
  expect(props.fetchFaveStar).toHaveBeenCalledWith(props.itemId);

  rerender(<FaveStar {...{ ...props, itemId: 2 }} />);
  expect(props.fetchFaveStar).toHaveBeenCalledTimes(2);
});
