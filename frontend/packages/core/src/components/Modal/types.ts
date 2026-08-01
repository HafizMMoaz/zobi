import type { CSSProperties, ReactNode } from 'react';
import type { FormInstance, ModalFuncProps } from 'antd';
import type { ResizableProps } from 're-resizable';
import type { DraggableProps } from 'react-draggable';
import { ButtonStyle } from '../Button/types';

export interface ModalProps {
  className?: string;
  children: ReactNode;
  disablePrimaryButton?: boolean;
  primaryTooltipMessage?: ReactNode;
  primaryButtonLoading?: boolean;
  onHide: () => void;
  onHandledPrimaryAction?: () => void;
  primaryButtonName?: string;
  primaryButtonStyle?: ButtonStyle;
  show: boolean;
  name?: string;
  title: ReactNode;
  width?: string | number;
  maxWidth?: string;
  responsive?: boolean;
  hideFooter?: boolean;
  centered?: boolean;
  footer?: ReactNode;
  wrapProps?: object;
  height?: string;
  closable?: boolean;
  resizable?: boolean;
  resizableConfig?: ResizableProps;
  draggable?: boolean;
  draggableConfig?: DraggableProps;
  destroyOnHidden?: boolean;
  maskClosable?: boolean;
  zIndex?: number;
  /** @deprecated Use styles.body instead */
  bodyStyle?: CSSProperties;
  styles?: { body?: CSSProperties; [key: string]: CSSProperties | undefined };
  openerRef?: React.RefObject<HTMLElement>;
}

export interface StyledModalProps {
  maxWidth?: string;
  responsive?: boolean;
  height?: string;
  hideFooter?: boolean;
  draggable?: boolean;
  resizable?: boolean;
}

export type { ModalFuncProps };

export interface FormModalProps extends Omit<ModalProps, 'children'> {
  children: ReactNode | ((form: FormInstance) => ReactNode);
  initialValues?: object;
  formSubmitHandler: (values: object) => Promise<void>;
  onSave: () => void;
  requiredFields: string[];
}
