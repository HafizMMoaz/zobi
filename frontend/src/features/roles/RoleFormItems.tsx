import { FormItem, Input, AsyncSelect } from '@zobi.dev/core/components';
import { t } from '@zobi.dev/extension-api/translation';
import { fetchUserOptions } from '../groups/utils';
import { fetchGroupOptions, fetchPermissionOptions } from './utils';

interface AsyncOptionsFieldProps {
  addDangerToast: (msg: string) => void;
  loading?: boolean;
}

interface UsersFieldProps {
  addDangerToast: (msg: string) => void;
  loading: boolean;
}

export const RoleNameField = () => (
  <FormItem
    name="roleName"
    label={t('Role Name')}
    rules={[{ required: true, message: t('Role name is required') }]}
  >
    <Input name="roleName" data-test="role-name-input" />
  </FormItem>
);

export const PermissionsField = ({
  addDangerToast,
  loading = false,
}: AsyncOptionsFieldProps) => (
  <FormItem name="rolePermissions" label={t('Permissions')}>
    <AsyncSelect
      mode="multiple"
      name="rolePermissions"
      placeholder={t('Select permissions')}
      options={(filterValue, page, pageSize) =>
        fetchPermissionOptions(filterValue, page, pageSize, addDangerToast)
      }
      loading={loading}
      getPopupContainer={trigger => trigger.closest('.ant-modal-content')}
      data-test="permissions-select"
    />
  </FormItem>
);

export const UsersField = ({ addDangerToast, loading }: UsersFieldProps) => (
  <FormItem name="roleUsers" label={t('Users')}>
    <AsyncSelect
      name="roleUsers"
      mode="multiple"
      placeholder={t('Select users')}
      options={(filterValue, page, pageSize) =>
        fetchUserOptions(filterValue, page, pageSize, addDangerToast)
      }
      loading={loading}
      data-test="roles-select"
    />
  </FormItem>
);

export const GroupsField = ({
  addDangerToast,
  loading = false,
}: AsyncOptionsFieldProps) => (
  <FormItem name="roleGroups" label={t('Groups')}>
    <AsyncSelect
      mode="multiple"
      name="roleGroups"
      placeholder={t('Select groups')}
      options={(filterValue, page, pageSize) =>
        fetchGroupOptions(filterValue, page, pageSize, addDangerToast)
      }
      loading={loading}
      data-test="groups-select"
    />
  </FormItem>
);
