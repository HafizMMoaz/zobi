import { formatLocale, FormatLocaleDefinition } from 'd3-format';
import { isRequired } from '../../utils';
import NumberFormatter from '../NumberFormatter';
import { NumberFormatFunction } from '../types';
import { DEFAULT_D3_FORMAT } from '../D3FormatConfig';

export default function createD3NumberFormatter(config: {
  description?: string;
  formatString: string;
  label?: string;
  locale?: FormatLocaleDefinition;
}) {
  const {
    description,
    formatString = isRequired('config.formatString'),
    label,
    locale,
  } = config;

  let formatFunc: NumberFormatFunction;
  let isInvalid = false;

  try {
    formatFunc = formatLocale(locale ?? DEFAULT_D3_FORMAT).format(formatString);
  } catch (error) {
    formatFunc = value => `${value} (Invalid format: ${formatString})`;
    isInvalid = true;
  }

  return new NumberFormatter({
    description,
    formatFunc,
    id: formatString,
    isInvalid,
    label,
  });
}
