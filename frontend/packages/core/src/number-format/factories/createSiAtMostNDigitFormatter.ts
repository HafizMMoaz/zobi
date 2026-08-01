

import { formatLocale } from 'd3-format';
import NumberFormatter from '../NumberFormatter';
import { DEFAULT_D3_FORMAT } from '../D3FormatConfig';

export default function createSiAtMostNDigitFormatter(
  config: {
    description?: string;
    n?: number;
    id?: string;
    label?: string;
  } = {},
) {
  const { description, n = 3, id, label } = config;
  const locale = formatLocale(DEFAULT_D3_FORMAT);
  const siFormatter = locale.format(`.${n}s`);

  return new NumberFormatter({
    description,
    formatFunc: value => {
      const si = siFormatter(value);

      /* Removing trailing `.00` if any */
      return si.slice(-1) < 'A' ? parseFloat(si).toString() : si;
    },
    id: id ?? `si_at_most_${n}_digit`,
    label: label ?? `SI with at most ${n} significant digits`,
  });
}
