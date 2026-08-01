

import {
  UnaryOperator,
  BinaryOperator,
  SetOperator,
  isUnaryOperator,
  isBinaryOperator,
  isSetOperator,
} from './Operator';
import { TimeGranularity } from '../../time-format';

interface BaseAdhocFilter {
  clause: 'WHERE' | 'HAVING';
  timeGrain?: TimeGranularity;
  isExtra?: boolean;
}

interface BaseSimpleAdhocFilter extends BaseAdhocFilter {
  expressionType: 'SIMPLE';
  subject: string;
}

export type UnaryAdhocFilter = BaseSimpleAdhocFilter & {
  operator: UnaryOperator;
};

export type BinaryAdhocFilter = BaseSimpleAdhocFilter & {
  operator: BinaryOperator;
  comparator: string;
};

export type SetAdhocFilter = BaseSimpleAdhocFilter & {
  operator: SetOperator;
  comparator: string[];
};

export type SimpleAdhocFilter =
  | UnaryAdhocFilter
  | BinaryAdhocFilter
  | SetAdhocFilter;

export interface FreeFormAdhocFilter extends BaseAdhocFilter {
  expressionType: 'SQL';
  sqlExpression: string;
}

export interface LatestPartitionAdhocFilter extends BaseAdhocFilter {
  datasource?: { schema?: string; datasource_name?: string };
}

export type AdhocFilter = SimpleAdhocFilter | FreeFormAdhocFilter;

//---------------------------------------------------
// Type guards
//---------------------------------------------------

export function isSimpleAdhocFilter(
  filter: AdhocFilter,
): filter is SimpleAdhocFilter {
  return filter.expressionType === 'SIMPLE';
}

export function isFreeFormAdhocFilter(
  filter: AdhocFilter,
): filter is FreeFormAdhocFilter {
  return filter.expressionType === 'SQL';
}

export function isUnaryAdhocFilter(
  filter: SimpleAdhocFilter,
): filter is UnaryAdhocFilter {
  return isUnaryOperator(filter.operator);
}

export function isBinaryAdhocFilter(
  filter: SimpleAdhocFilter,
): filter is BinaryAdhocFilter {
  return isBinaryOperator(filter.operator);
}

export function isSetAdhocFilter(
  filter: SimpleAdhocFilter,
): filter is SetAdhocFilter {
  return isSetOperator(filter.operator);
}
