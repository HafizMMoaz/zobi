

import { ColorSchemeGroup } from './types';

export interface ColorSchemeConfig {
  colors: string[];
  description?: string;
  id: string;
  label?: string;
  isDefault?: boolean;
  group?: ColorSchemeGroup;
}

export default class ColorScheme {
  colors: string[];

  description: string;

  id: string;

  label: string;

  isDefault?: boolean;

  group?: ColorSchemeGroup;

  constructor({
    colors,
    description = '',
    id,
    label,
    isDefault,
    group,
  }: ColorSchemeConfig) {
    this.id = id;
    this.label = label ?? id;
    this.colors = colors;
    this.description = description;
    this.isDefault = isDefault;
    this.group = group;
  }
}
