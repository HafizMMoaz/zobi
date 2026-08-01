import { rgb } from 'd3-color';

// eslint-disable-next-line import/prefer-default-export
export function hexToRGB(
  hex: string | undefined,
  alpha = 255,
): [number, number, number, number] {
  if (!hex) {
    return [0, 0, 0, alpha];
  }
  const { r, g, b } = rgb(hex);

  return [r, g, b, alpha];
}
