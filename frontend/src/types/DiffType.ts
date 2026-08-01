export type FilterItemType = {
  comparator?: string | string[];
  subject: string;
  operator: string;
  label?: string;
};

export type DiffItemType<
  T = FilterItemType | number | string | Record<string | number, any>,
> =
  | T[]
  | boolean
  | number
  | string
  | Record<string | number, any>
  | null
  | undefined;

export type DiffType = {
  before: DiffItemType;
  after: DiffItemType;
};
