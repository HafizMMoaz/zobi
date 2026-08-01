import { t } from '@zobi/core/translation';

import { Icons } from '@zobi-ui/core/components';
import { DIVIDER_TYPE } from '../../../util/componentTypes';
import { NEW_DIVIDER_ID } from '../../../util/constants';
import DraggableNewComponent from './DraggableNewComponent';

export default function DraggableNewDivider() {
  return (
    <DraggableNewComponent
      id={NEW_DIVIDER_ID}
      type={DIVIDER_TYPE}
      label={t('Divider')}
      IconComponent={Icons.LineOutlined}
    />
  );
}
