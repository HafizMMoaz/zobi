import { useEffect, useMemo, useState, FC } from 'react';
import { isEmpty } from 'lodash';
import { t } from '@zobi/core/translation';
import getControlsForVizType from 'src/utils/getControlsForVizType';
import {
  Label,
  Icons,
  Tooltip,
  ModalTrigger,
  TableView,
} from '@zobi-ui/core/components';
import type { AlteredSliceTagProps, ControlMap, RowType } from './types';
import { getRowsFromDiffs } from './utils';

export const AlteredSliceTag: FC<AlteredSliceTagProps> = props => {
  const [rows, setRows] = useState<RowType[]>([]);
  const [hasDiffs, setHasDiffs] = useState<boolean>(false);

  useEffect(() => {
    const controlsMap = getControlsForVizType(
      props.origFormData?.viz_type,
    ) as ControlMap;

    setRows(getRowsFromDiffs(props.diffs, controlsMap));
    setHasDiffs(!isEmpty(props.diffs));
  }, [props.diffs, props.origFormData?.viz_type]);

  const modalBody = useMemo(() => {
    const columns = [
      {
        accessor: 'control',
        Header: t('Control'),
        id: 'control',
      },
      {
        accessor: 'before',
        Header: t('Before'),
        id: 'before',
      },
      {
        accessor: 'after',
        Header: t('After'),
        id: 'after',
      },
    ];
    // set the wrap text in the specific columns.
    const columnsForWrapText = ['control', 'before', 'after'];

    return (
      <TableView
        columns={columns}
        data={rows}
        pageSize={50}
        className="table-condensed"
        columnsForWrapText={columnsForWrapText}
      />
    );
  }, [rows]);

  const triggerNode = useMemo(
    () => (
      <Tooltip id="difference-tooltip" title={t('Click to see difference')}>
        <Label
          icon={<Icons.ExclamationCircleOutlined iconSize="m" />}
          className="label"
          type="warning"
          onClick={() => {}}
        >
          {t('Altered')}
        </Label>
      </Tooltip>
    ),
    [],
  );

  if (!hasDiffs) {
    return null;
  }

  return (
    <ModalTrigger
      triggerNode={triggerNode}
      modalTitle={t('Chart changes')}
      modalBody={modalBody}
      responsive
    />
  );
};

export type { AlteredSliceTagProps };
