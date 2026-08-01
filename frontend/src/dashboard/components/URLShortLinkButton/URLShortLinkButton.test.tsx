import { render, screen, userEvent } from 'spec/helpers/testing-library';
import fetchMock from 'fetch-mock';
import URLShortLinkButton from 'src/dashboard/components/URLShortLinkButton';
import ToastContainer from 'src/components/MessageToasts/ToastContainer';

const DASHBOARD_ID = 10;
const PERMALINK_PAYLOAD = {
  key: '123',
  url: 'http://fakeurl.com/123',
};
const FILTER_STATE_PAYLOAD = {
  value: '{}',
};

const props = {
  dashboardId: DASHBOARD_ID,
};

fetchMock.get(
  `glob:*/api/v1/dashboard/${DASHBOARD_ID}/filter_state*`,
  FILTER_STATE_PAYLOAD,
);

const postDashboardPermanentlinkMockUrl = `glob:*/api/v1/dashboard/${DASHBOARD_ID}/permalink`;
fetchMock.post(postDashboardPermanentlinkMockUrl, PERMALINK_PAYLOAD, {
  name: postDashboardPermanentlinkMockUrl,
});

test('renders with default props', () => {
  render(<URLShortLinkButton {...props} />, { useRedux: true });
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('renders overlay on click', async () => {
  render(<URLShortLinkButton {...props} />, { useRedux: true });
  userEvent.click(screen.getByRole('button'));
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
});

test('obtains short url', async () => {
  render(<URLShortLinkButton {...props} />, { useRedux: true });
  userEvent.click(screen.getByRole('button'));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    PERMALINK_PAYLOAD.url,
  );
});

test('creates email anchor', async () => {
  const subject = 'Subject';
  const content = 'Content';

  render(
    <URLShortLinkButton
      {...props}
      emailSubject={subject}
      emailContent={content}
    />,
    {
      useRedux: true,
    },
  );

  const href = `mailto:?Subject=${subject}%20&Body=${content}${PERMALINK_PAYLOAD.url}`;
  userEvent.click(screen.getByRole('button'));
  expect(await screen.findByRole('link')).toHaveAttribute('href', href);
});

test('renders error message on short url error', async () => {
  fetchMock.removeRoute(postDashboardPermanentlinkMockUrl);
  fetchMock.route(`glob:*/api/v1/dashboard/${DASHBOARD_ID}/permalink`, 500);

  render(
    <>
      <URLShortLinkButton {...props} />
      <ToastContainer />
    </>,
    { useRedux: true },
  );
  userEvent.click(screen.getByRole('button'));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
