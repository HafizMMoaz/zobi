import { JsonObject } from '@zobi-ui/core';
import { omit } from 'lodash';

const TEMPORARY_CONTROLS: string[] = ['url_params'];

export const sanitizeFormData = (formData: JsonObject): JsonObject =>
  omit(formData, TEMPORARY_CONTROLS);
