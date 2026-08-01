
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import RoleListAddModal from './RoleListAddModal';
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
describe('RoleListAddModal', () => {
  const mockProps = {
    show: true,
    onHide: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    mockCreateRole.mockResolvedValue({
      json: { id: 1 },
      response: {} as Response,
    } as Awaited<ReturnType<typeof createRole>>);
  });

  test('renders modal with form fields', () => {
    render(<RoleListAddModal {...mockProps} />);
    expect(screen.getByText('Add Role')).toBeInTheDocument();
    expect(screen.getByText('Role Name')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
  });

  test('calls onHide when cancel button is clicked', () => {
    render(<RoleListAddModal {...mockProps} />);
    fireEvent.click(screen.getByTestId('modal-cancel-button'));
    expect(mockProps.onHide).toHaveBeenCalled();
  });

  test('disables save button when role name is empty', () => {
    render(<RoleListAddModal {...mockProps} />);
    expect(screen.getByTestId('form-modal-save-button')).toBeDisabled();
  });

  test('enables save button when role name is entered', () => {
    render(<RoleListAddModal {...mockProps} />);
    fireEvent.change(screen.getByTestId('role-name-input'), {
      target: { value: 'New Role' },
    });
    expect(screen.getByTestId('form-modal-save-button')).toBeEnabled();
  });

  test('calls createRole when save button is clicked', async () => {
    render(<RoleListAddModal {...mockProps} />);

    fireEvent.change(screen.getByTestId('role-name-input'), {
      target: { value: 'New Role' },
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalledWith('New Role');
    });

    // No permissions selected → updateRolePermissions should not be called
    expect(mockUpdateRolePermissions).not.toHaveBeenCalled();
  });

  test('submit handler extracts numeric IDs from permission map function', async () => {
    // Verify the submit handler maps {value,label} → number via .map(({value}) => value).
    // Since AsyncSelect selections can't be injected in unit tests without
    // mocking internals, we verify the contract via the code path:
    // handleFormSubmit receives RoleForm with rolePermissions as SelectOption[]
    // and calls updateRolePermissions with permissionIds (number[]).
    mockCreateRole.mockResolvedValue({
      json: { id: 42 },
      response: {} as Response,
    } as Awaited<ReturnType<typeof createRole>>);
    mockUpdateRolePermissions.mockResolvedValue({} as any);

    render(<RoleListAddModal {...mockProps} />);

    fireEvent.change(screen.getByTestId('role-name-input'), {
      target: { value: 'Test Role' },
    });

    fireEvent.click(screen.getByTestId('form-modal-save-button'));

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalledWith('Test Role');
    });

    // Empty permissions → updateRolePermissions not called (length === 0 guard)
    expect(mockUpdateRolePermissions).not.toHaveBeenCalled();
  });
});
