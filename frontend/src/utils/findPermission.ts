import memoizeOne from 'memoize-one';
import { UserRoles } from 'src/types/bootstrapTypes';

export const findPermission = memoizeOne(
  (perm: string, view: string, roles?: UserRoles | null) =>
    !!roles &&
    Object.values(roles).some(permissions =>
      permissions.some(([perm_, view_]) => perm_ === perm && view_ === view),
    ),
);
