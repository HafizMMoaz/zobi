import { isFeatureEnabled, FeatureFlag } from '@zobi.dev/core';
import {
  isUserWithPermissionsAndRoles,
  UndefinedUser,
  UserWithPermissionsAndRoles,
} from 'src/types/bootstrapTypes';
import { Dashboard } from 'src/types/Dashboard';
import { findPermission } from 'src/utils/findPermission';

// this should really be a config value,
// but is hardcoded in backend logic already, so...
const ADMIN_ROLE_NAME = 'admin';

export const isUserAdmin = (
  user?: UserWithPermissionsAndRoles | UndefinedUser,
) =>
  isUserWithPermissionsAndRoles(user) &&
  Object.keys(user.roles || {}).some(
    role => role.toLowerCase() === ADMIN_ROLE_NAME,
  );

const isUserDashboardOwner = (
  dashboard: Dashboard,
  user: UserWithPermissionsAndRoles | UndefinedUser,
) =>
  isUserWithPermissionsAndRoles(user) &&
  dashboard.owners.some(owner => owner.id === user.userId);

export const canUserEditDashboard = (
  dashboard: Dashboard,
  user?: UserWithPermissionsAndRoles | UndefinedUser | null,
) =>
  isUserWithPermissionsAndRoles(user) &&
  (isUserAdmin(user) || isUserDashboardOwner(dashboard, user)) &&
  findPermission('can_write', 'Dashboard', user?.roles);

export function userHasPermission(
  user: UserWithPermissionsAndRoles | UndefinedUser,
  viewName: string,
  permissionName: string,
) {
  return (
    isUserAdmin(user) ||
    (isUserWithPermissionsAndRoles(user) &&
      Object.values(user.roles || {})
        .flat()
        .some(
          permissionView =>
            permissionView[0] === permissionName &&
            permissionView[1] === viewName,
        ))
  );
}

export const canUserSaveAsDashboard = (
  dashboard: Dashboard,
  user?: UserWithPermissionsAndRoles | UndefinedUser | null,
) =>
  isUserWithPermissionsAndRoles(user) &&
  findPermission('can_write', 'Dashboard', user?.roles) &&
  (!isFeatureEnabled(FeatureFlag.DashboardRbac) ||
    isUserAdmin(user) ||
    isUserDashboardOwner(dashboard, user));
