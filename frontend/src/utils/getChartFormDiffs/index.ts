import { isEqual } from 'lodash';
import { DiffType } from 'src/types/DiffType';
import { JsonObject } from '@zobi-ui/core';
import { sanitizeFormData } from '../sanitizeFormData';

export const noisyKeys = new Set(['filters', 'having', 'where']);

export const alterForComparison = (value: unknown): unknown => {
  if (value == null || value === '') return null;
  if (Array.isArray(value) && value.length === 0) return null;
  if (typeof value === 'object' && value && Object.keys(value).length === 0)
    return null;

  return value;
};

export const isEqualish = (a: unknown, b: unknown): boolean =>
  isEqual(alterForComparison(a), alterForComparison(b));

export const getChartFormDiffs = (
  originalFormData: Record<string, unknown>,
  currentFormData: Record<string, unknown>,
): Record<string, DiffType> => {
  const ofd: JsonObject = sanitizeFormData(originalFormData);
  const cfd: JsonObject = sanitizeFormData(currentFormData);

  const keys = new Set([...Object.keys(ofd), ...Object.keys(cfd)]);
  const diffs: Record<string, DiffType> = {};

  keys.forEach((key: string) => {
    if (noisyKeys.has(key)) return;

    const original = ofd[key];
    const current = cfd[key];

    const currentHasKey = Object.prototype.hasOwnProperty.call(cfd, key);
    const originalHasKey = Object.prototype.hasOwnProperty.call(ofd, key);

    const bothExplicit = currentHasKey && originalHasKey;

    if (!bothExplicit && !currentHasKey) return;

    if (!isEqualish(original, current))
      diffs[key] = { before: original, after: current };
  });

  return diffs;
};
