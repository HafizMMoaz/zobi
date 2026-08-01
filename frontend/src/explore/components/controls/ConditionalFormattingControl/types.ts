
import { ReactNode } from 'react';
import { PopoverProps } from '@zobi-ui/core/components/Popover';
import {
  Comparator,
  ControlComponentProps,
  ObjectFormattingEnum,
} from '@zobi-ui/chart-controls';
import { GenericDataType } from '@zobi/core/common';

export type ConditionalFormattingConfig = {
  operator?: Comparator;
  targetValue?: number;
  targetValueLeft?: number;
  targetValueRight?: number;
  column?: string;
  colorScheme?: string;
  toAllRow?: boolean;
  toTextColor?: boolean;
  useGradient?: boolean;
  columnFormatting?: string;
  objectFormatting?: ObjectFormattingEnum;
};

export type ConditionalFormattingControlProps = ControlComponentProps<
  ConditionalFormattingConfig[]
> & {
  columnOptions: ColumnOption[];
  removeIrrelevantConditions: boolean;
  verboseMap: Record<string, string>;
  label: string;
  description: string;
  extraColorChoices?: { label: string; value: string }[];
  allColumns?: ColumnOption[];
};

export type FormattingPopoverProps = PopoverProps & {
  columns: ColumnOption[];
  onChange: (value: ConditionalFormattingConfig) => void;
  config?: ConditionalFormattingConfig;
  title: string;
  children: ReactNode;
  extraColorChoices?: { label: string; value: string }[];
  allColumns?: ColumnOption[];
};

export interface ColumnOption {
  label: string;
  value: string;
  dataType: GenericDataType;
}
