import { ReactNode } from 'react';
import { AdhocColumn, JsonValue } from '@zobi-ui/core';
import { ControlComponentProps } from 'src/explore/components/Control';
import { ColumnMeta } from '@zobi-ui/chart-controls';

export interface OptionProps {
  children?: ReactNode;
  index: number;
  label?: string;
  tooltipTitle?: string;
  column?: ColumnMeta | AdhocColumn;
  clickClose: (index: number) => void;
  withCaret?: boolean;
  isExtra?: boolean;
  datasourceWarningMessage?: string;
  canDelete?: boolean;
  tooltipOverlay?: ReactNode;
  multiValueWarningMessage?: string;
}

export interface OptionItemInterface {
  type: string;
  dragIndex: number;
}

/**
 * Shared control props for all DnD control.
 */
export type DndControlProps<ValueType extends JsonValue> =
  ControlComponentProps<ValueType | ValueType[] | null> & {
    multi?: boolean;
    canDelete?: boolean;
    ghostButtonText?: string;
    onChange: (value: ValueType | ValueType[] | null | undefined) => void;
  };

export type OptionValueType = Record<string, any>;
