import { t } from '@zobi.dev/extension-api/translation';

import { Icons } from '@zobi.dev/core/components';
import { ROW_TYPE } from '../../../util/componentTypes';
import { NEW_ROW_ID } from '../../../util/constants';
import DraggableNewComponent from './DraggableNewComponent';
import { FC } from 'react';

type DraggableNewRowProps = {};

const DraggableNewRow: FC<DraggableNewRowProps> = () => (
  <DraggableNewComponent
    id={NEW_ROW_ID}
    type={ROW_TYPE}
    label={t('Row')}
    IconComponent={Icons.ColumnHeightOutlined}
  />
);

export default DraggableNewRow;
