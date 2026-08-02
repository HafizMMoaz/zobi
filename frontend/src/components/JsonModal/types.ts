type CellDataType = string | number | null | object;

export interface JsonModalProps {
  modalTitle: string;
  jsonObject: Record<string, unknown> | unknown[];
  jsonValue: CellDataType;
  wrapContent?: boolean;
}
