import { t } from '@zobi/core/translation';

import { Icons } from '@zobi-ui/core/components';
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
