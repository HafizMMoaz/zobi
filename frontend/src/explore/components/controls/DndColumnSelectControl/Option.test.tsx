import {
  cleanup,
  render,
  screen,
  userEvent,
} from 'spec/helpers/testing-library';
import Option from 'src/explore/components/controls/DndColumnSelectControl/Option';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('Option', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  afterEach(async () => {
    cleanup();
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  test('renders with default props', async () => {
    const { container, unmount } = render(
      <Option index={1} clickClose={jest.fn()}>
        Option
      </Option>,
    );
    expect(container).toBeInTheDocument();
    expect(
      await screen.findByRole('img', { name: 'close' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'right' }),
    ).not.toBeInTheDocument();
    unmount();
  });

  test('renders with caret', async () => {
    const { unmount } = render(
      <Option index={1} clickClose={jest.fn()} withCaret>
        Option
      </Option>,
    );
    expect(
      await screen.findByRole('img', { name: 'close' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('img', { name: 'right' }),
    ).toBeInTheDocument();
    unmount();
  });

  test('renders with extra triangle', async () => {
    const { unmount } = render(
      <Option index={1} clickClose={jest.fn()} isExtra>
        Option
      </Option>,
    );
    expect(
      await screen.findByRole('button', { name: 'Show info tooltip' }),
    ).toBeInTheDocument();
    unmount();
  });

  test('triggers onClose', async () => {
    const clickClose = jest.fn();
    const { unmount } = render(
      <Option index={1} clickClose={clickClose}>
        Option
      </Option>,
    );
    userEvent.click(await screen.findByRole('img', { name: 'close' }));
    expect(clickClose).toHaveBeenCalled();
    unmount();
  });
});
