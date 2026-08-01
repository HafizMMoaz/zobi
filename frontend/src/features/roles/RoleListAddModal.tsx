import { t } from '@zobi/core/translation';
import { ModalTitleWithIcon } from 'src/components/ModalTitleWithIcon';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { FormModal, Icons } from '@zobi-ui/core/components';
import { createRole, updateRolePermissions } from './utils';
import { PermissionsField, RoleNameField } from './RoleFormItems';
import { BaseModalProps, RoleForm } from './types';

export type RoleListAddModalProps = BaseModalProps;

function RoleListAddModal({ show, onHide, onSave }: RoleListAddModalProps) {
  const { addDangerToast, addSuccessToast } = useToasts();
  const handleFormSubmit = async (values: RoleForm) => {
    try {
      const { json: roleResponse } = await createRole(values.roleName);
      const permissionIds =
        values.rolePermissions?.map(({ value }) => value) || [];

      if (permissionIds.length > 0) {
        await updateRolePermissions(roleResponse.id, permissionIds);
      }

      addSuccessToast(t('The role has been created successfully.'));
    } catch (err) {
      addDangerToast(
        t('There was an error creating the role. Please, try again.'),
      );
      throw err;
    }
  };

  return (
    <FormModal
      show={show}
      onHide={onHide}
      name="Add Role"
      title={
        <ModalTitleWithIcon
          title={t('Add Role')}
          icon={<Icons.PlusOutlined />}
        />
      }
      onSave={onSave}
      formSubmitHandler={handleFormSubmit}
      requiredFields={['roleName']}
      initialValues={{}}
    >
      <>
        <RoleNameField />
        <PermissionsField addDangerToast={addDangerToast} />
      </>
    </FormModal>
  );
}

export default RoleListAddModal;
