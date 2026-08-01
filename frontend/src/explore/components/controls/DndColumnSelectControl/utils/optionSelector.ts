import { ColumnMeta, isColumnMeta } from '@zobi.dev/chart-controls';
import { t } from '@zobi.dev/extension-api/translation';
import {
  AdhocColumn,
  ensureIsArray,
  QueryFormColumn,
  isPhysicalColumn,
} from '@zobi.dev/core';

const getColumnNameOrAdhocColumn = (
  column: ColumnMeta | AdhocColumn,
): QueryFormColumn => {
  if (isColumnMeta(column)) {
    return column.column_name;
  }
  return column as AdhocColumn;
};

export class OptionSelector {
  values: (ColumnMeta | AdhocColumn)[];

  options: Record<string, ColumnMeta>;

  multi: boolean;

  constructor(
    options: Record<string, ColumnMeta>,
    multi: boolean,
    initialValues?: QueryFormColumn[] | QueryFormColumn | null,
  ) {
    this.options = options;
    this.multi = multi;
    this.values = ensureIsArray(initialValues)
      .map(value => {
        if (value && isPhysicalColumn(value) && value in options) {
          return options[value];
        }
        if (!isPhysicalColumn(value)) {
          return value;
        }
        return {
          type_generic: 'UNKNOWN',
          column_name: value,
          error_text: t(
            'This column might be incompatible with current dataset',
          ),
        };
      })
      .filter(Boolean) as ColumnMeta[];
  }

  add(value: QueryFormColumn) {
    if (isPhysicalColumn(value) && value in this.options) {
      this.values.push(this.options[value]);
    } else if (!isPhysicalColumn(value)) {
      this.values.push(value as AdhocColumn);
    }
  }

  del(idx: number) {
    this.values.splice(idx, 1);
  }

  replace(idx: number, value: QueryFormColumn) {
    if (this.values[idx]) {
      this.values[idx] = isPhysicalColumn(value) ? this.options[value] : value;
    }
  }

  swap(a: number, b: number) {
    [this.values[a], this.values[b]] = [this.values[b], this.values[a]];
  }

  has(value: QueryFormColumn): boolean {
    return this.values.some(col => {
      if (isPhysicalColumn(value)) {
        return (
          (col as ColumnMeta).column_name === value ||
          (col as AdhocColumn).label === value
        );
      }
      return (
        (col as ColumnMeta).column_name === value.label ||
        (col as AdhocColumn).label === value.label
      );
    });
  }

  getValues(): QueryFormColumn[] | QueryFormColumn | undefined {
    if (!this.multi) {
      return this.values.length > 0
        ? getColumnNameOrAdhocColumn(this.values[0])
        : undefined;
    }
    return this.values.map(getColumnNameOrAdhocColumn);
  }
}
