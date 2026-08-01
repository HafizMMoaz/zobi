export interface EditableTitleProps {
  canEdit?: boolean;
  editing?: boolean;
  emptyText?: string;
  extraClasses?: Array<string> | string;
  noPermitTooltip?: string;
  onSaveTitle: (arg0: string) => void;
  showTooltip?: boolean;
  style?: object;
  title?: string;
  defaultTitle?: string;
  placeholder?: string;
  certifiedBy?: string;
  certificationDetails?: string;
  renderLink?: (title: string) => React.ReactNode;
  maxWidth?: number;
  autoSize?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}
