import { FormatLocaleDefinition } from 'd3-format';
import { RegistryWithDefaultKey, OverwritePolicy } from '../models';
import { DEFAULT_D3_FORMAT } from './D3FormatConfig';
import createD3NumberFormatter from './factories/createD3NumberFormatter';
import createSmartNumberFormatter from './factories/createSmartNumberFormatter';
import NumberFormats from './NumberFormats';
import NumberFormatter from './NumberFormatter';

export default class NumberFormatterRegistry extends RegistryWithDefaultKey<
  NumberFormatter,
  NumberFormatter
> {
  d3Format: FormatLocaleDefinition;

  constructor() {
    super({
      name: 'NumberFormatter',
      overwritePolicy: OverwritePolicy.Warn,
    });

    this.registerValue(
      NumberFormats.SMART_NUMBER,
      createSmartNumberFormatter(),
    );
    this.registerValue(
      NumberFormats.SMART_NUMBER_SIGNED,
      createSmartNumberFormatter({ signed: true }),
    );
    this.setDefaultKey(NumberFormats.SMART_NUMBER);
    this.d3Format = DEFAULT_D3_FORMAT;
  }

  setD3Format(d3Format: Partial<FormatLocaleDefinition>) {
    this.d3Format = { ...DEFAULT_D3_FORMAT, ...d3Format };
    return this;
  }

  get(formatterId?: string) {
    const targetFormat = `${
      formatterId === null ||
      typeof formatterId === 'undefined' ||
      formatterId === ''
        ? this.defaultKey
        : formatterId
    }`.trim();

    if (this.has(targetFormat)) {
      return super.get(targetFormat) as NumberFormatter;
    }

    // Create new formatter if does not exist
    const formatter = createD3NumberFormatter({
      formatString: targetFormat,
      locale: this.d3Format,
    });
    this.registerValue(targetFormat, formatter);

    return formatter;
  }

  format(
    formatterId: string | undefined,
    value: number | null | undefined,
  ): string {
    return this.get(formatterId)(value);
  }
}
