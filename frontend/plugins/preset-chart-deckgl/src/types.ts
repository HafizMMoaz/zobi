// range and point actually have different value ranges
// and also are different concept-wise

export type Range = [number, number];
export type Point = [number, number];
export interface ColorType {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorBreakpointType {
  color: ColorType;
  minValue: number;
  maxValue: number;
}
