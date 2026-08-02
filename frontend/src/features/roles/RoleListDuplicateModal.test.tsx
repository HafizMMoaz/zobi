import {
  render,
  screen,
  fireEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import RoleListDuplicateModal from './RoleListDuplicateModal';
import { createRole, updateRolePermissions } from './utils';

const mockToasts = {
  addDangerToast: jest.fn(),
  addSuccessToast: jest.fn(),
};

jest.mock('./utils');
const mockCreateRole = jest.mocked(createRole);
const mockUpdateRolePermissions = jest.mocked(updateRolePermissions);

jest.mock('src/components/MessageToasts/withToasts', () => ({
  __esModule: true,
  default: (Component: any) => Component,
  useToasts: () => mockToasts,
}));
// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('RoleListDuplicateModal', () => {
  const mockRole = {
    id: 1,
    name: 'Admin',
    permission_ids: [10, 20],
    user_ids: [1],
    group_ids: [],
  };

  const mockProps = {
    role: mockRole,
    show: true,
    onHide: jest.fn(),
    onSave: jest.fn(),
  };

  test('renders modal with form fields', () => {
    render(<RoleListDuplicateModal {...mockProps} />);
    expect(
      screen.getByText(`Duplicate role ${mockRole.name}`),
    ).toBeInTheDocument();
    expect(screen.getByText('Role Name')).toBeInTheDocument();
  });

  test('calls onHide when cancel button is clicked', () => {
    render(<RoleListDuplicateModal {...mockProps} />);
    fireEvent.click(screen.getByTestId('modal-cancel-button'));
    expect(mockProps.onHide).toHaveBeenCalled();
  });

  test('disables save button when role name is empty', () => {
    render(<RoleListDuplicateModal {...mockProps} />);
    expect(screen.getByTestId('form-modal-save-button')).toBeDisabled();
  });

  test('enables save button when role name is entered', () => {
    render(<RoleListDuplicateModal {...mockProps} />);
    fireEvent.change(screen.getByTestId('role-name-input'), {
      target: { value: 'New Role' },
    });
    expect(screen.getByTestId('form-modal-save-button')).toBeEnabled();
  });

  test('calls createRole when save button is clicked', async () => {
    mockCreateRole.mockResolvedValue({ json: { id: 2 } } as any);

    render(<RoleListDuplicateModal {...mockProps} />);

    fireEvent.change(screen.getByTestId('role-name-input'), {
      target: { value: 'New Role' },
    });

    fireEvent.click(screen.getByTestId('form-modal-save-button'));

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalledWith('New Role');
      expect(mockUpdateRolePermissions).toHaveBeenCalledWith(2, [10, 20]);
    });
  });
});
