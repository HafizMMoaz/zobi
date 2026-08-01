
export type Unit =
  | 'square_m'
  | 'radius_m'
  | 'radius_km'
  | 'radius_miles'
  | 'square_km'
  | 'square_miles';

export const defaultViewport = {
  bearing: 0,
  latitude: 31.222656842808707,
  longitude: 6.85236157047845,
  pitch: 0,
  zoom: 1,
};

const METER_TO_MILE = 1609.34;

export function unitToRadius(unit: Unit, num: number) {
  if (unit === 'square_m') {
    return Math.sqrt(num / Math.PI);
  }
  if (unit === 'radius_m') {
    return num;
  }
  if (unit === 'radius_km') {
    return num * 1000;
  }
  if (unit === 'radius_miles') {
    return num * METER_TO_MILE;
  }
  if (unit === 'square_km') {
    return Math.sqrt(num / Math.PI) * 1000;
  }
  if (unit === 'square_miles') {
    return Math.sqrt(num / Math.PI) * METER_TO_MILE;
  }

  return null;
}
