import { common as coreType } from '@zobi.dev/extension-api';
import { Disposable } from './models';

const { GenericDataType } = coreType;

export const core: typeof coreType = {
  GenericDataType,
  Disposable,
};

export * from './authentication';
export * from './commands';
export * from './editors';
export * from './extensions';
export * from './menus';
export * from './models';
export * from './sqlLab';
export * from './utils';
export * from './views';
