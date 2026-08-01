import { t } from '@zobi.dev/extension-api/translation';

import { Icons } from '@zobi.dev/core/components';
import { HEADER_TYPE } from '../../../util/componentTypes';
import { NEW_HEADER_ID } from '../../../util/constants';
import DraggableNewComponent from './DraggableNewComponent';

export default function DraggableNewHeader() {
  return (
    <DraggableNewComponent
      id={NEW_HEADER_ID}
      type={HEADER_TYPE}
      label={t('Header')}
      IconComponent={Icons.FontColorsOutlined}
    />
  );
}
