import {
  DTTM_ALIAS,
  getColumnLabel,
  isQueryFormColumn,
  QueryFormData,
  QueryFormColumn,
  Optional,
} from '@zobi-ui/core';

export const isXAxisSet = (formData: QueryFormData) =>
  isQueryFormColumn(formData.x_axis);

export const getXAxisColumn = (
  formData: QueryFormData,
): Optional<QueryFormColumn> => {
  // The formData should be "raw form_data" -- the snake_case version of formData rather than camelCase.
  if (!(formData.granularity_sqla || formData.x_axis)) {
    return undefined;
  }

  if (isXAxisSet(formData)) {
    return formData.x_axis;
  }
  return DTTM_ALIAS;
};

export const getXAxisLabel = (formData: QueryFormData): Optional<string> => {
  const col = getXAxisColumn(formData);
  if (col) {
    return getColumnLabel(col);
  }
  return undefined;
};
