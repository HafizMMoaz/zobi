import { TimeLocaleDefinition } from 'd3-time-format';
import { RegistryWithDefaultKey, OverwritePolicy } from '../models';
import { DEFAULT_D3_TIME_FORMAT } from './D3FormatConfig';
import TimeFormats, { LOCAL_PREFIX } from './TimeFormats';
import createD3TimeFormatter from './factories/createD3TimeFormatter';
import TimeFormatter from './TimeFormatter';

export default class TimeFormatterRegistry extends RegistryWithDefaultKey<
  TimeFormatter,
  TimeFormatter
> {
  d3Format: TimeLocaleDefinition;

  constructor() {
    super({
      initialDefaultKey: TimeFormats.DATABASE_DATETIME,
      name: 'TimeFormatter',
      overwritePolicy: OverwritePolicy.Warn,
    });

    this.d3Format = DEFAULT_D3_TIME_FORMAT;
  }

  setD3Format(d3Format: Partial<TimeLocaleDefinition>) {
    this.d3Format = { ...DEFAULT_D3_TIME_FORMAT, ...d3Format };
    return this;
  }

  get(format?: string) {
    const targetFormat = `${
      format === null || typeof format === 'undefined' || format === ''
        ? this.defaultKey
        : format
    }`.trim();

    if (this.has(targetFormat)) {
      return super.get(targetFormat) as TimeFormatter;
    }

    // Create new formatter if does not exist
    const useLocalTime = targetFormat.startsWith(LOCAL_PREFIX);
    const formatString = targetFormat.replace(LOCAL_PREFIX, '');
    const locale = this.d3Format;
    const formatter = createD3TimeFormatter({
      formatString,
      useLocalTime,
      locale,
    });

    this.registerValue(targetFormat, formatter);

    return formatter;
  }

  format(format: string | undefined, value: Date | null | undefined): string {
    return this.get(format)(value);
  }
}
