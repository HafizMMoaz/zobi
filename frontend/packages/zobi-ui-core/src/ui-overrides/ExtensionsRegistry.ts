import { TypedRegistry } from '../models';
import { makeSingleton } from '../utils';
import { Extensions } from './types';

/**
 * A registry containing extensions which can alter Zobi's UI at specific points defined by Zobi.
 * See SIP-87: https://github.com/HafizMMoaz/zobi/issues/20615
 */
class ExtensionsRegistry extends TypedRegistry<Extensions> {
  name = 'ExtensionsRegistry';
}

export const getExtensionsRegistry = makeSingleton(ExtensionsRegistry, {});
