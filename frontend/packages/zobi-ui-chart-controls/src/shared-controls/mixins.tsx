import { t } from '@zobi/core/translation';
import {
  ensureIsArray,
  NO_TIME_RANGE,
  QueryFormData,
  validateNonEmpty,
} from '@zobi-ui/core';
import {
  BaseControlConfig,
  ControlPanelState,
  ControlState,
  ExtraControlProps,
} from '../types';
import { getTemporalColumns } from '../utils';

const getAxisLabel = (
  formData: QueryFormData,
): Record<'label' | 'description', string> =>
  formData?.orientation === 'horizontal'
    ? { label: t('Y-axis'), description: t('Dimension to use on y-axis.') }
    : { label: t('X-axis'), description: t('Dimension to use on x-axis.') };

export const xAxisMixin = {
  label: (state: ControlPanelState) => getAxisLabel(state?.form_data).label,
  multi: false,
  description: (state: ControlPanelState) =>
    getAxisLabel(state?.form_data).description,
  validators: [validateNonEmpty],
  initialValue: (control: ControlState, state: ControlPanelState | null) => {
    if (
      state?.form_data?.granularity_sqla &&
      !state.form_data?.x_axis &&
      !control?.value
    ) {
      return state.form_data.granularity_sqla;
    }
    return undefined;
  },
  default: undefined,
};

export const temporalColumnMixin: Pick<BaseControlConfig, 'mapStateToProps'> &
  Partial<ExtraControlProps> = {
  isTemporal: true,
  mapStateToProps: ({ datasource }) => {
    const payload = getTemporalColumns(datasource);

    return {
      options: payload.temporalColumns,
      default: payload.defaultTemporalColumn,
    };
  },
};

export const datePickerInAdhocFilterMixin: Pick<
  BaseControlConfig,
  'initialValue'
> = {
  initialValue: (control: ControlState, state: ControlPanelState | null) => {
    // skip initialValue if
    // 1) the time_range control is present (this is the case for legacy charts)
    // 2) there was a time filter in adhoc filters
    if (
      state?.controls?.time_range?.value ||
      ensureIsArray(control.value).some(
        (flt: any) => flt?.operator === 'TEMPORAL_RANGE',
      )
    ) {
      return undefined;
    }

    // should migrate original granularity_sqla and time_range into adhoc filter
    // 1) granularity_sqla and time_range are existed
    if (state?.form_data?.granularity_sqla && state?.form_data?.time_range) {
      return [
        ...ensureIsArray(control.value),
        {
          clause: 'WHERE',
          subject: state.form_data.granularity_sqla,
          operator: 'TEMPORAL_RANGE',
          comparator: state.form_data.time_range,
          expressionType: 'SIMPLE',
        },
      ];
    }

    // should apply the default time filter into adhoc filter
    // 1) temporal column is existed in current datasource
    const temporalColumn =
      state?.datasource &&
      getTemporalColumns(state.datasource).defaultTemporalColumn;
    if (temporalColumn) {
      return [
        ...ensureIsArray(control.value),
        {
          clause: 'WHERE',
          subject: temporalColumn,
          operator: 'TEMPORAL_RANGE',
          comparator: state?.common?.conf?.DEFAULT_TIME_FILTER || NO_TIME_RANGE,
          expressionType: 'SIMPLE',
        },
      ];
    }

    return undefined;
  },
};
