export interface ColorsInitLookup {
  [key: string]: string | number;
}

export interface ColorsLookup {
  [key: string]: string;
}

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export enum ColorSchemeGroup {
  Custom = 'custom',
  Featured = 'featured',
  Other = 'other',
}
