export interface BaseUserListModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
}

export type FormValues = {
  [key: string]: string | number | boolean | string[] | number[];
};
