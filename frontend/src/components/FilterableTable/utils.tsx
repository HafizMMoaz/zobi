import { t } from '@zobi.dev/extension-api/translation';
import { safeHtmlSpan } from '@zobi.dev/core';
import { JsonModal } from '../JsonModal';
import { safeJsonObjectParse } from '../JsonModal/utils';
import { NULL_STRING, CellDataType } from './useCellContentParser';

type CellParams = {
  cellData: CellDataType;
  columnKey: string;
};

type Params = CellParams & {
  allowHTML?: boolean;
  getCellContent?: (args: CellParams) => string;
};

export const renderResultCell = ({
  cellData,
  getCellContent,
  columnKey,
  allowHTML = true,
}: Params) => {
  const cellNode =
    getCellContent?.({ cellData, columnKey }) ?? String(cellData);
  if (cellData === null) {
    return <i className="text-muted">{NULL_STRING}</i>;
  }
  const jsonObject = safeJsonObjectParse(cellData);
  if (jsonObject) {
    return (
      <JsonModal
        modalTitle={t('Cell content')}
        jsonObject={jsonObject}
        jsonValue={cellData}
        wrapContent={false}
      />
    );
  }
  if (allowHTML && typeof cellData === 'string') {
    return safeHtmlSpan(cellNode);
  }
  return cellNode;
};
