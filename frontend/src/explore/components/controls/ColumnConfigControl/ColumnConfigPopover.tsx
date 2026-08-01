import { GenericDataType } from '@zobi/core/common';
import Tabs from '@zobi-ui/core/components/Tabs';
import {
  SHARED_COLUMN_CONFIG_PROPS,
  SharedColumnConfigProp,
} from './constants';
import {
  ColumnConfig,
  ColumnConfigFormItem,
  ColumnConfigFormLayout,
  ColumnConfigInfo,
  ControlFormItemDefaultSpec,
  isTabLayoutItem,
  TabLayoutItem,
} from './types';
import ControlForm, { ControlFormItem, ControlFormRow } from './ControlForm';

export type ColumnConfigPopoverProps = {
  column: ColumnConfigInfo;
  configFormLayout: ColumnConfigFormLayout;
  onChange: (value: ColumnConfig) => void;
  width?: number | string;
  height?: number | string;
};

export default function ColumnConfigPopover({
  column,
  configFormLayout,
  onChange,
}: ColumnConfigPopoverProps) {
  const renderRow = (row: ColumnConfigFormItem[], i: number) => (
    <ControlFormRow key={i}>
      {row.map(meta => {
        const key = typeof meta === 'string' ? meta : meta.name;
        const override =
          typeof meta === 'string'
            ? {}
            : 'override' in meta
              ? meta.override
              : meta.config;
        const props = {
          ...(key in SHARED_COLUMN_CONFIG_PROPS
            ? SHARED_COLUMN_CONFIG_PROPS[key as SharedColumnConfigProp]
            : undefined),
          ...override,
        } as ControlFormItemDefaultSpec;
        return <ControlFormItem key={key} name={key} {...props} />;
      })}
    </ControlFormRow>
  );

  const layout =
    configFormLayout[
      column.type === undefined ? GenericDataType.String : column.type
    ];

  if (isTabLayoutItem(layout[0])) {
    const tabItems = (layout as TabLayoutItem[])
      .filter(isTabLayoutItem)
      .map((item: TabLayoutItem, i: number) => ({
        key: i.toString(),
        label: item.tab,
        children: (
          <ControlForm onChange={onChange} value={column.config}>
            {item.children.map(
              (row: ColumnConfigFormItem[], rowIndex: number) =>
                renderRow(row, rowIndex),
            )}
          </ControlForm>
        ),
      }));

    return <Tabs items={tabItems} />;
  }
  return (
    <ControlForm onChange={onChange} value={column.config}>
      {(layout as ColumnConfigFormItem[][]).map(
        (row: ColumnConfigFormItem[], i: number) => renderRow(row, i),
      )}
    </ControlForm>
  );
}
