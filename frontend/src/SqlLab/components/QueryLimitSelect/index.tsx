import { useAppDispatch } from 'src/views/store';
import { t } from '@zobi/core/translation';
import { Dropdown, Button } from '@zobi-ui/core/components';
import { Menu } from '@zobi-ui/core/components/Menu';
import { Icons } from '@zobi-ui/core/components/Icons';
import { queryEditorSetQueryLimit } from 'src/SqlLab/actions/sqlLab';
import useQueryEditor from 'src/SqlLab/hooks/useQueryEditor';

export interface QueryLimitSelectProps {
  queryEditorId: string;
  maxRow: number;
  defaultQueryLimit: number;
}

export function convertToNumWithSpaces(num: number) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
}

export function convertToShortNum(num: number) {
  if (num < 1000) {
    return num;
  }
  if (num < 1_000_000) {
    return `${num / 1000}K`;
  }
  if (num < 1_000_000_000) {
    return `${num / 1000_000}M`;
  }
  return num;
}

function renderQueryLimit(
  maxRow: number,
  setQueryLimit: (limit: number) => void,
) {
  const limitDropdown = [];

  // Construct limit dropdown as increasing powers of ten until we reach SQL_MAX_ROW
  for (let i = 10; i < maxRow; i *= 10) {
    limitDropdown.push(i);
  }
  limitDropdown.push(maxRow);

  return (
    <Menu
      items={[...new Set(limitDropdown)].map(limit => ({
        key: `${limit}`,
        onClick: () => setQueryLimit(limit),
        label: `${convertToNumWithSpaces(limit)} `,
      }))}
    />
  );
}

const QueryLimitSelect = ({
  queryEditorId,
  maxRow,
  defaultQueryLimit,
}: QueryLimitSelectProps) => {
  const dispatch = useAppDispatch();

  const queryEditor = useQueryEditor(queryEditorId, ['id', 'queryLimit']);
  const queryLimit = queryEditor.queryLimit || defaultQueryLimit;
  const setQueryLimit = (updatedQueryLimit: number) =>
    dispatch(queryEditorSetQueryLimit(queryEditor, updatedQueryLimit));

  return (
    <Dropdown
      popupRender={() => renderQueryLimit(maxRow, setQueryLimit)}
      trigger={['click']}
    >
      <Button
        size="small"
        color="default"
        variant="text"
        showMarginRight={false}
      >
        <span>{t('Limit')}</span>
        <span className="limitDropdown">{convertToShortNum(queryLimit)}</span>
        <Icons.DownOutlined iconSize="m" />
      </Button>
    </Dropdown>
  );
};

export default QueryLimitSelect;
