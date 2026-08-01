import { ReactNode } from 'react';
import { OptionValueType } from 'src/explore/components/controls/DndColumnSelectControl/types';
import { ControlComponentProps } from 'src/explore/components/Control';

export interface ColorType {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorBreakpointType {
  id?: number;
  color?: ColorType;
  minValue?: number;
  maxValue?: number;
}

export interface ErrorMapType {
  color: string[];
  minValue: string[];
  maxValue: string[];
}

export interface ColorBreakpointsControlProps extends ControlComponentProps<
  OptionValueType[]
> {
  breakpoints: ColorBreakpointType[];
}

export interface ColorBreakpointsPopoverTriggerProps {
  description?: string;
  hovered?: boolean;
  value?: ColorBreakpointType;
  children?: ReactNode;
  saveColorBreakpoint: (colorBreakpoint: ColorBreakpointType) => void;
  isControlled?: boolean;
  visible?: boolean;
  toggleVisibility?: (visibility: boolean) => void;
  colorBreakpoints: ColorBreakpointType[];
}

export interface ColorBreakpointsPopoverControlProps {
  description?: string;
  hovered?: boolean;
  value?: ColorBreakpointType;
  onSave?: (colorBreakpoint: ColorBreakpointType) => void;
  onClose?: () => void;
  colorBreakpoints: ColorBreakpointType[];
}

export interface ColorBreakpointOptionProps {
  breakpoint: ColorBreakpointType;
  colorBreakpoints: ColorBreakpointType[];
  index: number;
  saveColorBreakpoint: (colorBreakpoint: ColorBreakpointType) => void;
  onClose: (index: number) => void;
  onShift: (hoverIndex: number, dragIndex: number) => void;
}
