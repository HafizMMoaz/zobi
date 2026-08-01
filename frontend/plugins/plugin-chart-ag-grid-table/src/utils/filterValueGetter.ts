/* eslint-disable camelcase */
import { ValueGetterParams } from '@zobi-ui/core/components/ThemedAgGridReact';

const filterValueGetter = (params: ValueGetterParams) => {
  const raw = params.data[params.colDef.field as string];
  const formatter = params.colDef.valueFormatter as Function;
  if (!raw || !formatter) return null;
  const formatted = formatter({
    value: raw,
  });

  const numeric = parseFloat(String(formatted).replace('%', '').trim());
  return Number.isNaN(numeric) ? null : numeric;
};

export default filterValueGetter;
