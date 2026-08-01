import type { ControlPanelState, Dataset } from '@zobi-ui/chart-controls';

interface TimeGrainOverrideState {
  choices: [string, string][] | null;
}

export default {
  default: null,
  mapStateToProps: (state: ControlPanelState): TimeGrainOverrideState => ({
    choices:
      state.datasource && 'time_grain_sqla' in state.datasource
        ? ((state.datasource as Dataset).time_grain_sqla?.filter(
            (o: [string, string]) => o[0] !== null,
          ) ?? null)
        : null,
  }),
};
