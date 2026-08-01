import { ExtensibleFunction } from '../models';
import { isRequired } from '../utils';
import { TimeFormatFunction } from './types';
import stringifyTimeInput from './utils/stringifyTimeInput';

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

export const PREVIEW_TIME = new Date(Date.UTC(2017, 1, 14, 11, 22, 33));

// Use type augmentation to indicate that
// an instance of TimeFormatter is also a function
interface TimeFormatter {
  (value: Date | number | string | null | undefined): string;
}

class TimeFormatter extends ExtensibleFunction {
  id: string;

  label: string;

  description: string;

  formatFunc: TimeFormatFunction;

  useLocalTime: boolean;

  constructor(config: {
    id: string;
    label?: string;
    description?: string;
    formatFunc: TimeFormatFunction;
    useLocalTime?: boolean;
  }) {
    super((value: Date | number | string | null | undefined) =>
      this.format(value),
    );

    const {
      id = isRequired('config.id'),
      label,
      description = '',
      formatFunc = isRequired('config.formatFunc'),
      useLocalTime = false,
    } = config;

    this.id = id;
    this.label = label ?? id;
    this.description = description;
    this.formatFunc = formatFunc;
    this.useLocalTime = useLocalTime;
  }

  format(value: Date | number | string | null | undefined) {
    return stringifyTimeInput(value, time => this.formatFunc(time));
  }

  preview(value: Date = PREVIEW_TIME) {
    return `${value.toUTCString()} => ${this.format(value)}`;
  }
}

export default TimeFormatter;
