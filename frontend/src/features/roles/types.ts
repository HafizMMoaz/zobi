export type PermissionView = {
  name: string;
};

export type PermissionResource = {
  id: number;
  permission: PermissionView;
  view_menu: PermissionView;
};

export type RolePermissions = {
  id: number;
  permission_name: string;
  view_menu_name: string;
};

export type UserObject = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isActive: boolean;
  roles: Array<RoleInfo>;
};

export type SelectOption = {
  value: number;
  label: string;
};

export type RoleInfo = {
  id: number;
  name: string;
};

export type RoleForm = {
  roleName: string;
  rolePermissions?: SelectOption[];
  roleUsers?: SelectOption[];
  roleGroups?: SelectOption[];
};

export interface BaseModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
}
