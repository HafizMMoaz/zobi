import { JsonValue, QueryFormData } from '@zobi-ui/core';
import { ControlStateMapping } from '@zobi-ui/chart-controls';

export function getFormDataFromControls(
  controlsState: ControlStateMapping,
): QueryFormData {
  const formData: Record<string, JsonValue | undefined> = {};
  Object.keys(controlsState).forEach(controlName => {
    const control = controlsState[controlName];
    formData[controlName] = control.value;
  });
  return formData as QueryFormData;
}
