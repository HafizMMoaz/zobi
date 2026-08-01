import { render, act } from 'spec/helpers/testing-library';
import AnchorLink from 'src/dashboard/components/AnchorLink';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('AnchorLink', () => {
  const props = {
    id: 'CHART-123',
    dashboardId: 10,
  };

  const globalLocation = window.location;
  afterEach(() => {
    window.location = globalLocation;
  });

  test('should scroll the AnchorLink into view upon mount if id matches hash', async () => {
    const callback = jest.fn();
    jest.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView: callback,
    } as unknown as HTMLElement);

    window.location.hash = props.id;
    await act(async () => {
      render(<AnchorLink {...props} />, { useRedux: true });
    });
    expect(callback).toHaveBeenCalledTimes(1);

    window.location.hash = 'random';
    await act(async () => {
      render(<AnchorLink {...props} />, { useRedux: true });
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should render anchor link without short link button', () => {
    const { container, queryByRole } = render(
      <AnchorLink showShortLinkButton={false} {...props} />,
      { useRedux: true },
    );
    expect(container.querySelector(`#${props.id}`)).toBeInTheDocument();
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  test('should render short link button', () => {
    const { getByRole } = render(
      <AnchorLink {...props} showShortLinkButton />,
      { useRedux: true },
    );
    expect(getByRole('button')).toBeInTheDocument();
  });
});
