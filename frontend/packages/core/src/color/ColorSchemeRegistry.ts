import { RegistryWithDefaultKey, OverwritePolicy } from '../models';

export default class ColorSchemeRegistry<T> extends RegistryWithDefaultKey<T> {
  constructor() {
    super({
      name: 'ColorScheme',
      overwritePolicy: OverwritePolicy.Warn,
      setFirstItemAsDefault: true,
    });
  }

  get(key?: string, strict = false) {
    const target = super.get(key) as T | undefined;

    // falls back to default scheme if any
    if (!strict && !target) {
      const defaultKey = super.getDefaultKey();
      if (defaultKey) {
        return super.get(defaultKey) as T | undefined;
      }
    }
    return target;
  }
}
