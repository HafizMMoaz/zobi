import { scaleLinear } from '@visx/scale';
import { ACCESSIBLE_COLOR_BOUNDS } from '../../constants';

/**
 * Generates a color based on a numeric value and color bounds
 * @param value - The numeric value to generate color for
 * @param bounds - Optional array containing min and max bounds
 * @param colorBounds - Array of colors to use for the bounds
 * @returns A color string or null if no bounds are provided
 */
export function colorFromBounds(
  value: number | null,
  bounds?: [number | null, number | null] | null[],
  colorBounds: string[] = ACCESSIBLE_COLOR_BOUNDS,
): string | null {
  if (bounds && bounds.length > 0) {
    const [min, max] = bounds;
    const [minColor, maxColor] = colorBounds;

    if (
      min !== null &&
      max !== null &&
      min !== undefined &&
      max !== undefined
    ) {
      const colorScale = scaleLinear<string>()
        .domain([min, (max + min) / 2, max])
        .range([minColor, 'grey', maxColor]);

      return colorScale(value || 0) || null;
    }

    if (min !== null && min !== undefined)
      return value !== null && value >= min ? maxColor : minColor;

    if (max !== null && max !== undefined)
      return value !== null && value < max ? maxColor : minColor;
  }

  return null;
}
