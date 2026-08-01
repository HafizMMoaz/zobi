import { NumberFormatter } from '../number-format';
import { CurrencyFormatter } from '../currency-format';

export * from '../query/types';
export * from './AgGrid';

export type Maybe<T> = T | null;

export type Optional<T> = T | undefined;

export type ValueOf<T> = T[keyof T];

export type ValueFormatter = NumberFormatter | CurrencyFormatter;
