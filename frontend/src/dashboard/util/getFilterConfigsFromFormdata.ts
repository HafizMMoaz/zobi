/* eslint-disable camelcase */
import {
  FILTER_CONFIG_ATTRIBUTES,
  TIME_FILTER_LABELS,
  TIME_FILTER_MAP,
} from 'src/explore/constants';

interface FilterConfig {
  column: string;
  label: string;
  defaultValue?: string | null;
  vals?: string[] | string | null;
  [key: string]: unknown;
}

interface FilterFormData {
  date_filter?: boolean;
  filter_configs?: FilterConfig[];
  show_sqla_time_column?: boolean;
  show_sqla_time_granularity?: boolean;
  time_range?: string;
  time_grain_sqla?: string;
  granularity_sqla?: string;
  [key: string]: unknown;
}

interface FilterConfigs {
  columns: Record<string, string | string[] | null | undefined>;
  labels: Record<string, string>;
}

export default function getFilterConfigsFromFormdata(
  form_data: FilterFormData = {},
): FilterConfigs {
  const {
    date_filter,
    filter_configs = [],
    show_sqla_time_column,
    show_sqla_time_granularity,
  } = form_data;
  let configs = filter_configs.reduce<FilterConfigs>(
    ({ columns, labels }, config) => {
      let defaultValues: string | string[] | null | undefined = config[
        FILTER_CONFIG_ATTRIBUTES.DEFAULT_VALUE
      ] as string | null | undefined;

      // treat empty string as null (no default value)
      if (defaultValues === '') {
        defaultValues = null;
      }

      // defaultValue could be ; separated values,
      // could be null or ''
      if (defaultValues && config[FILTER_CONFIG_ATTRIBUTES.MULTIPLE]) {
        defaultValues = (defaultValues as string).split(';');
      }

      const updatedColumns = {
        ...columns,
        [config.column]: config.vals || defaultValues,
      };
      const updatedLabels = {
        ...labels,
        [config.column]: config.label,
      };

      return {
        columns: updatedColumns,
        labels: updatedLabels,
      };
    },
    { columns: {}, labels: {} },
  );

  if (date_filter) {
    let updatedColumns = {
      ...configs.columns,
      [TIME_FILTER_MAP.time_range]: form_data.time_range,
    };
    const updatedLabels = {
      ...configs.labels,
      ...Object.entries(TIME_FILTER_MAP).reduce<Record<string, string>>(
        (map, [key, value]) => ({
          ...map,
          [value]:
            TIME_FILTER_LABELS[key as keyof typeof TIME_FILTER_LABELS] ?? '',
        }),
        {},
      ),
    };

    if (show_sqla_time_granularity) {
      updatedColumns = {
        ...updatedColumns,
        [TIME_FILTER_MAP.time_grain_sqla]: form_data.time_grain_sqla,
      };
    }

    if (show_sqla_time_column) {
      updatedColumns = {
        ...updatedColumns,
        [TIME_FILTER_MAP.granularity_sqla]: form_data.granularity_sqla,
      };
    }

    configs = {
      ...configs,
      columns: updatedColumns,
      labels: updatedLabels,
    };
  }
  return configs;
}
