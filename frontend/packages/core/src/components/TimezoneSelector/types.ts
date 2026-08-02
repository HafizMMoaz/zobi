export type TimezoneOption = {
  label: string;
  value: string;
  offsets: string;
  timezoneName: string;
};

export type OffsetsToName = Record<string, [string, string]>;

export type GetOffsetKeyFn = (timezoneName: string) => string;
