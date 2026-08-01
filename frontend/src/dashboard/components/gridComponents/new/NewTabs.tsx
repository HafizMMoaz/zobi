import { t } from '@zobi/core/translation';

import { Icons } from '@zobi-ui/core/components';
import { TABS_TYPE } from '../../../util/componentTypes';
import { NEW_TABS_ID } from '../../../util/constants';
import DraggableNewComponent from './DraggableNewComponent';

export default function DraggableNewTabs() {
  return (
    <DraggableNewComponent
      id={NEW_TABS_ID}
      type={TABS_TYPE}
      label={t('Tabs')}
      IconComponent={Icons.DownSquareOutlined}
    />
  );
}
