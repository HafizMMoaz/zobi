import { debounce } from 'lodash';
import { Constants } from '@zobi.dev/core/components';

export const debounceFunc = debounce(
  (func: (val: string) => void, source: string) => func(source),
  Constants.SLOW_DEBOUNCE,
);
