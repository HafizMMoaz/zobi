import { render, screen } from 'spec/helpers/testing-library';
import SqlEditorTopBar, {
  SqlEditorTopBarProps,
} from 'src/SqlLab/components/SqlEditorTopBar';
import { ViewLocations } from 'src/SqlLab/contributions';
import {
  registerToolbarAction,
  cleanupExtensions,
} from 'spec/helpers/extensionTestHelpers';

afterEach(cleanupExtensions);

const defaultProps: SqlEditorTopBarProps = {
  queryEditorId: 'test-query-editor-id',
  defaultPrimaryActions: <button type="button">Primary Action</button>,
  defaultSecondaryActions: [
    { key: 'action1', label: 'Action 1' },
    { key: 'action2', label: 'Action 2' },
  ],
};

const setup = (props?: Partial<SqlEditorTopBarProps>) =>
  render(<SqlEditorTopBar {...defaultProps} {...props} />);

test('renders defaultPrimaryActions', () => {
  setup();
  expect(
    screen.getByRole('button', { name: 'Primary Action' }),
  ).toBeInTheDocument();
});

test('renders with custom primary actions', () => {
  const customPrimaryActions = (
    <>
      <button type="button">Custom Action 1</button>
      <button type="button">Custom Action 2</button>
    </>
  );

  setup({ defaultPrimaryActions: customPrimaryActions });

  expect(
    screen.getByRole('button', { name: 'Custom Action 1' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Custom Action 2' }),
  ).toBeInTheDocument();
});

test('renders contributed toolbar action in editor slot', () => {
  registerToolbarAction(
    ViewLocations.sqllab.editor,
    'test-editor-action',
    'Test Editor Action',
    jest.fn(),
  );
  setup();
  expect(
    screen.getByRole('button', { name: 'Test Editor Action' }),
  ).toBeInTheDocument();
});

test('renders nothing when no toolbar actions registered and no default actions', () => {
  setup({
    defaultPrimaryActions: undefined,
    defaultSecondaryActions: [],
  });
  // PanelToolbar returns null when there are no actions at all
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
