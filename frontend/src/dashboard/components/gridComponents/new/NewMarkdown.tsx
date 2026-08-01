import { t } from '@zobi/core/translation';

import { Icons } from '@zobi-ui/core/components';
import { MARKDOWN_TYPE } from '../../../util/componentTypes';
import { NEW_MARKDOWN_ID } from '../../../util/constants';
import DraggableNewComponent from './DraggableNewComponent';

export default function DraggableNewDivider() {
  return (
    <DraggableNewComponent
      id={NEW_MARKDOWN_ID}
      type={MARKDOWN_TYPE}
      label={t('Text / Markdown')}
      IconComponent={Icons.FileMarkdownOutlined}
    />
  );
}
