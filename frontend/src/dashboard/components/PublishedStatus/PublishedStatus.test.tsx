import { render, screen, userEvent } from 'spec/helpers/testing-library';
import PublishedStatus from '.';

const defaultProps = {
  dashboardId: 1,
  isPublished: false,
  savePublished: jest.fn(),
  userCanEdit: false,
  userCanSave: false,
};

test('renders with unpublished status and readonly permissions', async () => {
  const tooltip =
    /This dashboard is not published which means it will not show up in the list of dashboards/;
  render(<PublishedStatus {...defaultProps} />);
  expect(screen.getByText('Draft')).toBeInTheDocument();
  userEvent.hover(screen.getByText('Draft'));
  expect(await screen.findByText(tooltip)).toBeInTheDocument();
});

test('renders with unpublished status and write permissions', async () => {
  const tooltip =
    /This dashboard is not published, it will not show up in the list of dashboards/;
  const savePublished = jest.fn();
  render(
    <PublishedStatus
      {...defaultProps}
      userCanEdit
      userCanSave
      savePublished={savePublished}
    />,
  );
  expect(screen.getByText('Draft')).toBeInTheDocument();
  userEvent.hover(screen.getByText('Draft'));
  expect(await screen.findByText(tooltip)).toBeInTheDocument();
  expect(savePublished).not.toHaveBeenCalled();
  userEvent.click(screen.getByText('Draft'));
  expect(savePublished).toHaveBeenCalledTimes(1);
});

test('renders with published status and readonly permissions', () => {
  render(<PublishedStatus {...defaultProps} isPublished />);
  expect(screen.queryByText('Published')).not.toBeInTheDocument();
});

test('renders with published status and write permissions', async () => {
  const tooltip = /This dashboard is published. Click to make it a draft/;
  const savePublished = jest.fn();
  render(
    <PublishedStatus
      {...defaultProps}
      isPublished
      userCanEdit
      userCanSave
      savePublished={savePublished}
    />,
  );
  expect(screen.getByText('Published')).toBeInTheDocument();
  userEvent.hover(screen.getByText('Published'));
  expect(await screen.findByText(tooltip)).toBeInTheDocument();
  expect(savePublished).not.toHaveBeenCalled();
  userEvent.click(screen.getByText('Published'));
  expect(savePublished).toHaveBeenCalledTimes(1);
});
