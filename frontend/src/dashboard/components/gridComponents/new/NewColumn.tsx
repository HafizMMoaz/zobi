import { t } from '@zobi.dev/extension-api/translation';

import { Icons } from '@zobi.dev/core/components';
import { COLUMN_TYPE } from '../../../util/componentTypes';
import { NEW_COLUMN_ID } from '../../../util/constants';
import DraggableNewComponent from './DraggableNewComponent';

export default function DraggableNewColumn() {
  return (
    <DraggableNewComponent
      id={NEW_COLUMN_ID}
      type={COLUMN_TYPE}
      label={t('Column')}
      IconComponent={Icons.ColumnWidthOutlined}
    />
  );
}
