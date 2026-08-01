
import { Menu, MenuItem } from '@zobi-ui/core/components/Menu';
import {
  render,
  screen,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import * as copyTextToClipboard from 'src/utils/copy';
import fetchMock from 'fetch-mock';
import { ComponentProps } from 'react';
import { useShareMenuItems, ShareMenuItemProps } from '.';

const spy = jest.spyOn(copyTextToClipboard, 'default');

const DASHBOARD_ID = '26';
const createProps = () => ({
  addDangerToast: jest.fn(),
  addSuccessToast: jest.fn(),
  url: `/zobi/dashboard/${DASHBOARD_ID}`,
  copyMenuItemTitle: 'Copy dashboard URL',
  emailMenuItemTitle: 'Share dashboard by email',
  emailSubject: 'Zobi dashboard COVID Vaccine Dashboard',
  emailBody: 'Check out this dashboard: ',
  dashboardId: DASHBOARD_ID,
  title: 'Test Dashboard',
  submenuKey: 'share',
});

const postDashboardPermalinkMockUrl = `http://localhost/api/v1/dashboard/${DASHBOARD_ID}/permalink`;

let hrefValue = '';
let locationSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  hrefValue = '';
  locationSpy = jest.spyOn(window, 'location', 'get').mockReturnValue({
    ...window.location,
    get href() {
      return hrefValue;
    },
    set href(v: string) {
      hrefValue = v;
    },
  } as Location);
  fetchMock.clearHistory().removeRoutes();
  fetchMock.post(
    postDashboardPermalinkMockUrl,
    { key: '123', url: 'http://localhost/zobi/dashboard/p/123/' },
    { name: postDashboardPermalinkMockUrl },
  );
});

afterEach(() => {
  locationSpy.mockRestore();
  window.featureFlags = {};
  fetchMock.clearHistory().removeRoutes();
});

const MenuWrapper = (
  props: ComponentProps<typeof Menu> & { shareProps: ShareMenuItemProps },
) => {
  const shareMenuItems = useShareMenuItems(props.shareProps);
  const menuItems: MenuItem[] = [shareMenuItems];
  return <Menu {...props} items={menuItems} />;
};

test('Should render menu items', () => {
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={createProps()}
    />,
    { useRedux: true },
  );
  expect(screen.getByText('Copy dashboard URL')).toBeInTheDocument();
  expect(screen.getByText('Share dashboard by email')).toBeInTheDocument();
});

test('Click on "Copy dashboard URL" and succeed', async () => {
  spy.mockResolvedValue(undefined);
  const props = createProps();
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={props}
    />,
    { useRedux: true },
  );

  await waitFor(() => {
    expect(spy).toHaveBeenCalledTimes(0);
    expect(props.addSuccessToast).toHaveBeenCalledTimes(0);
    expect(props.addDangerToast).toHaveBeenCalledTimes(0);
  });

  await userEvent.click(screen.getByText('Copy dashboard URL'));

  await waitFor(async () => {
    expect(spy).toHaveBeenCalledTimes(1);
    const value = await spy.mock.calls[0][0]();
    expect(value).toBe('http://localhost/zobi/dashboard/p/123/');
    expect(props.addSuccessToast).toHaveBeenCalledTimes(1);
    expect(props.addSuccessToast).toHaveBeenCalledWith('Copied to clipboard!');
    expect(props.addDangerToast).toHaveBeenCalledTimes(0);
  });
});

test('Click on "Copy dashboard URL" and fail', async () => {
  spy.mockRejectedValue(undefined);
  const props = createProps();
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={props}
    />,
    { useRedux: true },
  );

  await waitFor(() => {
    expect(spy).toHaveBeenCalledTimes(0);
    expect(props.addSuccessToast).toHaveBeenCalledTimes(0);
    expect(props.addDangerToast).toHaveBeenCalledTimes(0);
  });

  await userEvent.click(screen.getByText('Copy dashboard URL'));

  await waitFor(async () => {
    expect(spy).toHaveBeenCalledTimes(1);
    const value = await spy.mock.calls[0][0]();
    expect(value).toBe('http://localhost/zobi/dashboard/p/123/');
    expect(props.addSuccessToast).toHaveBeenCalledTimes(0);
    expect(props.addDangerToast).toHaveBeenCalledTimes(1);
    expect(props.addDangerToast).toHaveBeenCalledWith(
      'Sorry, something went wrong. Try again later.',
    );
  });
});

test('Click on "Share dashboard by email" and succeed', async () => {
  const props = createProps();
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={props}
    />,
    { useRedux: true },
  );

  await waitFor(() => {
    expect(props.addDangerToast).toHaveBeenCalledTimes(0);
    expect(window.location.href).toBe('');
  });

  await userEvent.click(screen.getByText('Share dashboard by email'));

  await waitFor(() => {
    expect(props.addDangerToast).toHaveBeenCalledTimes(0);
    expect(window.location.href).toBe(
      'mailto:?Subject=Zobi%20dashboard%20COVID%20Vaccine%20Dashboard%20&Body=Check%20out%20this%20dashboard%3A%20http%3A%2F%2Flocalhost%2Fzobi%2Fdashboard%2Fp%2F123%2F',
    );
  });
});

test('Click on "Share dashboard by email" and fail', async () => {
  fetchMock.removeRoute(postDashboardPermalinkMockUrl);
  fetchMock.post(postDashboardPermalinkMockUrl, { status: 404 });
  const props = createProps();
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={props}
    />,
    { useRedux: true },
  );

  await waitFor(() => {
    expect(props.addDangerToast).toHaveBeenCalledTimes(0);
    expect(window.location.href).toBe('');
  });

  await userEvent.click(screen.getByText('Share dashboard by email'));

  await waitFor(() => {
    expect(window.location.href).toBe('');
    expect(props.addDangerToast).toHaveBeenCalledTimes(1);
    expect(props.addDangerToast).toHaveBeenCalledWith(
      'Sorry, something went wrong. Try again later.',
    );
  });
});

test('Should show "Embed code" menu item when feature flag is enabled and chart has data', () => {
  window.featureFlags = {
    EMBEDDABLE_CHARTS: true,
  };
  const props = createProps();
  const propsWithFormData = {
    ...props,
    latestQueryFormData: {
      datasource: '1__table',
      viz_type: 'table',
    },
  };
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={propsWithFormData}
    />,
    { useRedux: true },
  );
  expect(screen.getByText('Embed code')).toBeInTheDocument();
});

test('Should NOT show "Embed code" when feature flag is disabled', () => {
  window.featureFlags = {
    EMBEDDABLE_CHARTS: false,
  };
  const props = createProps();
  const propsWithFormData = {
    ...props,
    latestQueryFormData: {
      datasource: '1__table',
      viz_type: 'table',
    },
  };
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={propsWithFormData}
    />,
    { useRedux: true },
  );
  expect(screen.queryByText('Embed code')).not.toBeInTheDocument();
});

test('Should NOT show "Embed code" when chart has no data', () => {
  window.featureFlags = {
    EMBEDDABLE_CHARTS: true,
  };
  const props = createProps();
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={props}
    />,
    { useRedux: true },
  );
  expect(screen.queryByText('Embed code')).not.toBeInTheDocument();
});

test('Should NOT show "Embed code" when latestQueryFormData is empty object', () => {
  window.featureFlags = {
    EMBEDDABLE_CHARTS: true,
  };
  const props = createProps();
  const propsWithEmptyFormData = {
    ...props,
    latestQueryFormData: {},
  };
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={propsWithEmptyFormData}
    />,
    { useRedux: true },
  );
  expect(screen.queryByText('Embed code')).not.toBeInTheDocument();
});

test('Should render "Embed code" with data-test attribute', () => {
  window.featureFlags = {
    EMBEDDABLE_CHARTS: true,
  };
  const props = createProps();
  const propsWithFormData = {
    ...props,
    latestQueryFormData: {
      datasource: '1__table',
      viz_type: 'table',
    },
  };
  render(
    <MenuWrapper
      onClick={jest.fn()}
      selectable={false}
      data-test="main-menu"
      forceSubMenuRender
      shareProps={propsWithFormData}
    />,
    { useRedux: true },
  );
  expect(screen.getByTestId('embed-code-button')).toBeInTheDocument();
});
