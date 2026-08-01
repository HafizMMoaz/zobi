export type DynamicEditableTitleProps = {
  title: string;
  placeholder: string;
  onSave: (title: string) => void;
  canEdit: boolean;
  label: string | undefined;
};
