import { ControlStateMapping } from '@zobi.dev/chart-controls';

export const COLOR_SCHEME_TYPES = {
  fixed_color: 'fixed_color',
  categorical_palette: 'categorical_palette',
  linear_palette: 'linear_palette',
  color_breakpoints: 'color_breakpoints',
} as const;

export type ColorSchemeType =
  (typeof COLOR_SCHEME_TYPES)[keyof typeof COLOR_SCHEME_TYPES];

export function formatSelectOptions(options: (string | number)[]) {
  return options.map(opt => [opt, opt.toString()]);
}

export const isColorSchemeTypeVisible = (
  controls: ControlStateMapping,
  colorSchemeType: ColorSchemeType,
) => controls.color_scheme_type?.value === colorSchemeType;

export const isPointInBonds = (
  position: [number, number],
  area: [[number, number], [number, number]],
) => {
  const [lon, lat] = position;
  const fromLonLat = area[0];
  const toLatLon = area[1];

  return (
    lon >= fromLonLat[0] &&
    lon <= toLatLon[0] &&
    lat >= fromLonLat[1] &&
    lat <= toLatLon[1]
  );
};
