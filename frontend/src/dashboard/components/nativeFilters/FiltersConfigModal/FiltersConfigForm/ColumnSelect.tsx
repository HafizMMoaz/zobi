import { useCallback, useState, useMemo, useEffect } from 'react';
import rison from 'rison';
import { t } from '@zobi/core/translation';
import {
  Column,
  ensureIsArray,
  useChangeEffect,
  getClientErrorObject,
} from '@zobi-ui/core';
import { type FormInstance, Select } from '@zobi-ui/core/components';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { cachedZobiGet } from 'src/utils/cachedZobiGet';
import { NativeFiltersForm, NativeFiltersFormItem } from '../types';

interface ColumnSelectProps {
  allowClear?: boolean;
  filterValues?: (column: Column) => boolean;
  form: FormInstance<NativeFiltersForm>;
  formField?: keyof NativeFiltersFormItem;
  filterId: string;
  datasetId?: number;
  value?: string | string[];
  onChange?: (value: string) => void;
  mode?: 'multiple';
}

/** Special purpose AsyncSelect that selects a column from a dataset */
// eslint-disable-next-line import/prefer-default-export
export function ColumnSelect({
  allowClear = false,
  filterValues = () => true,
  form,
  formField = 'column',
  filterId,
  datasetId,
  value,
  onChange,
  mode,
}: ColumnSelectProps) {
  const [columns, setColumns] = useState<Column[]>();
  const [loading, setLoading] = useState(false);
  const { addDangerToast } = useToasts();
  const resetColumnField = useCallback(() => {
    form.setFields([
      { name: ['filters', filterId, formField], touched: false, value: null },
    ]);
  }, [form, filterId, formField]);

  const options = useMemo(
    () =>
      ensureIsArray(columns)
        .filter(filterValues)
        .map((col: Column) => col.column_name)
        .map((column: string) => ({ label: column, value: column })),
    [columns, filterValues],
  );

  const currentFilterType =
    form.getFieldValue('filters')?.[filterId].filterType;
  const currentColumn = useMemo(
    () => columns?.find(column => column.column_name === value),
    [columns, value],
  );

  useEffect(() => {
    if (currentColumn && !filterValues(currentColumn)) {
      resetColumnField();
    }
  }, [currentColumn, currentFilterType, resetColumnField]);

  useChangeEffect(datasetId, previous => {
    if (previous != null) {
      setColumns([]);
      resetColumnField();
    }
    if (datasetId != null) {
      setLoading(true);
      cachedZobiGet({
        endpoint: `/api/v1/dataset/${datasetId}?q=${rison.encode({
          columns: [
            'columns.column_name',
            'columns.is_dttm',
            'columns.type_generic',
            'columns.filterable',
          ],
        })}`,
      })
        .then(
          ({ json: { result } }) => {
            const lookupValue = Array.isArray(value) ? value : [value];
            const valueExists = result.columns.some((column: Column) =>
              lookupValue?.includes(column.column_name),
            );
            if (!valueExists) {
              resetColumnField();
            }
            setColumns(result.columns);
          },
          async badResponse => {
            const { error, message } = await getClientErrorObject(badResponse);
            let errorText = message || error || t('An error has occurred');
            if (message === 'Forbidden') {
              errorText = t(
                'You do not have permission to edit this dashboard',
              );
            }
            addDangerToast(errorText);
          },
        )
        .finally(() => setLoading(false));
    }
  });

  return (
    <Select
      mode={mode}
      value={mode === 'multiple' ? value || [] : value}
      ariaLabel={t('Column select')}
      loading={loading}
      onChange={onChange}
      options={options}
      placeholder={t('Select a column')}
      notFoundContent={t('No compatible columns found')}
      showSearch
      allowClear={allowClear}
    />
  );
}
