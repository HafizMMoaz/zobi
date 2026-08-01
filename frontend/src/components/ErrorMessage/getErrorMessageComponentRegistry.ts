import { Registry, makeSingleton, OverwritePolicy } from '@zobi-ui/core';
import type { ErrorMessageComponent } from './types';

class ErrorMessageComponentRegistry extends Registry<
  ErrorMessageComponent,
  ErrorMessageComponent
> {
  constructor() {
    super({
      name: 'ErrorMessageComponent',
      overwritePolicy: OverwritePolicy.Allow,
    });
  }
}

export const getErrorMessageComponentRegistry = makeSingleton(
  ErrorMessageComponentRegistry,
);
