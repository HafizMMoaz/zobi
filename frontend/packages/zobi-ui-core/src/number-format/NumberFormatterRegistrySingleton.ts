import { FormatLocaleDefinition } from 'd3-format';
import { makeSingleton } from '../utils';
import NumberFormatterRegistry from './NumberFormatterRegistry';

const getInstance = makeSingleton(NumberFormatterRegistry);

export default getInstance;

export function getNumberFormatter(format?: string) {
  return getInstance().get(format);
}

export function setD3Format(d3Format: Partial<FormatLocaleDefinition>) {
  getInstance().setD3Format(d3Format);
}

export function formatNumber(
  format: string | undefined,
  value: number | null | undefined,
) {
  return getInstance().format(format, value);
}
