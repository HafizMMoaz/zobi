import { t } from '@zobi.dev/extension-api/translation';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import {
  CheckboxChecked,
  CheckboxUnchecked,
  CheckboxHalfChecked,
} from '@zobi.dev/core/components/Checkbox/CheckboxIcons';

const treeIcons = {
  check: <CheckboxChecked />,
  uncheck: <CheckboxUnchecked />,
  halfCheck: <CheckboxHalfChecked />,
  expandClose: <span className="rct-icon rct-icon-expand-close" />,
  expandOpen: <span className="rct-icon rct-icon-expand-open" />,
  expandAll: (
    <span className="rct-icon rct-icon-expand-all">{t('Expand all')}</span>
  ),
  collapseAll: (
    <span className="rct-icon rct-icon-collapse-all">{t('Collapse all')}</span>
  ),
  parentClose: <span className="rct-icon rct-icon-parent-close" />,
  parentOpen: <span className="rct-icon rct-icon-parent-open" />,
  leaf: <span className="rct-icon rct-icon-leaf" />,
};

export default treeIcons;
