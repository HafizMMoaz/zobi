import { GroupObject, Role } from 'src/pages/GroupsList';

export interface BaseGroupListModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
}

export interface FormValues {
  name: string;
  label?: string;
  description?: string;
  roles: number[];
  users: { value: number; label: string }[];
}
export interface GroupModalProps extends BaseGroupListModalProps {
  roles: Role[];
  isEditMode?: boolean;
  group?: GroupObject;
}
