import { t, tn } from '@zobi.dev/extension-api/translation';
import { getNumberFormatter } from '@zobi.dev/core';

import { Label, Tooltip } from '@zobi.dev/core/components';

type RowCountLabelProps = {
  rowcount?: number;
  limit?: number;
  loading?: boolean;
  label?: JSX.Element;
};

const limitReachedMsg = t(
  'The row limit set for the chart was reached. The chart may show partial data.',
);

export default function RowCountLabel(props: RowCountLabelProps) {
  const { rowcount = 0, limit = null, loading, label } = props;
  const limitReached = limit && rowcount >= limit;
  const type =
    limitReached || (rowcount === 0 && !loading) ? 'error' : 'default';
  const formattedRowCount = getNumberFormatter()(rowcount);
  const labelText = (
    <Label type={type} monospace>
      {loading ? (
        t('Loading...')
      ) : (
        <span data-test="row-count-label">
          {tn('%s row', '%s rows', rowcount, formattedRowCount)}
        </span>
      )}
    </Label>
  );
  return limitReached ? (
    <Tooltip id="tt-rowcount-tooltip" title={<span>{limitReachedMsg}</span>}>
      {label || labelText}
    </Tooltip>
  ) : (
    label || labelText
  );
}

export type { RowCountLabelProps };
