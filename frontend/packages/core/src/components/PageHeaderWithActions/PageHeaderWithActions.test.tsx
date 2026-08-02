import { render, screen, userEvent } from '@zobi.dev/core/spec';
import { PageHeaderWithActions, PageHeaderWithActionsProps } from './index';
import { Menu } from '../Menu';

const defaultProps: PageHeaderWithActionsProps = {
  editableTitleProps: {
    title: 'Test title',
    placeholder: 'Test placeholder',
    onSave: jest.fn(),
    canEdit: true,
    label: 'Title',
  },
  showTitlePanelItems: true,
  certificatiedBadgeProps: {},
  showFaveStar: true,
  faveStarProps: { itemId: 1, saveFaveStar: jest.fn() },
  titlePanelAdditionalItems: <button type="button">Title panel button</button>,
  rightPanelAdditionalItems: <button type="button">Save</button>,
  additionalActionsMenu: (
    <Menu
      items={[{ label: 'Test menu item', key: '1' }]}
      data-test="additional-actions-menu"
    />
  ),
  menuDropdownProps: { onVisibleChange: jest.fn(), visible: true },
};

test('Renders', async () => {
  render(<PageHeaderWithActions {...defaultProps} />);
  expect(screen.getByText('Test title')).toBeVisible();
  expect(screen.getByTestId('fave-unfave-icon')).toBeVisible();
  expect(screen.getByText('Title panel button')).toBeVisible();
  expect(screen.getByText('Save')).toBeVisible();

  await userEvent.click(screen.getByLabelText('Menu actions trigger'));
  expect(defaultProps.menuDropdownProps.onVisibleChange).toHaveBeenCalled();
});
