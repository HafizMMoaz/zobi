import { t } from '@zobi.dev/extension-api/translation';

const CREATE_CHART_TEXT = t('Create chart');
const UPDATE_CHART_TEXT = t('Update chart');

export const getChartRequiredFieldsMissingMessage = (isCreating: boolean) =>
  t(
    'Select values in highlighted field(s) in the control panel. Then run the query by clicking on the %s button.',
    `"${isCreating ? CREATE_CHART_TEXT : UPDATE_CHART_TEXT}"`,
  );
