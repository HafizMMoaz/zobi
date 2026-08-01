import { ExtraFormDataOverride, QueryObject } from './types';
import {
  EXTRA_FORM_DATA_OVERRIDE_EXTRA_KEYS,
  EXTRA_FORM_DATA_OVERRIDE_REGULAR_MAPPINGS,
} from './constants';

export function overrideExtraFormData(
  queryObject: QueryObject,
  overrideFormData: ExtraFormDataOverride,
): QueryObject {
  const overriddenFormData: QueryObject = { ...queryObject };
  const { extras: overriddenExtras = {} } = overriddenFormData;
  Object.entries(EXTRA_FORM_DATA_OVERRIDE_REGULAR_MAPPINGS).forEach(
    ([key, target]) => {
      const value = overrideFormData[key as keyof ExtraFormDataOverride];
      if (value !== undefined) {
        overriddenFormData[target] = value;
      }
    },
  );
  EXTRA_FORM_DATA_OVERRIDE_EXTRA_KEYS.forEach(key => {
    if (key in overrideFormData) {
      // @ts-expect-error
      overriddenExtras[key] = overrideFormData[key];
    }
  });
  if (Object.keys(overriddenExtras).length > 0) {
    overriddenFormData.extras = overriddenExtras;
  }
  return overriddenFormData;
}
