import { PureComponent } from 'react';
import { t } from '@zobi/core/translation';

import PopoverDropdown, {
  OnChangeHandler,
} from '@zobi-ui/core/components/PopoverDropdown';

interface MarkdownModeDropdownProps {
  id: string;
  value: string;
  onChange: OnChangeHandler;
}

const dropdownOptions = [
  {
    value: 'edit',
    label: t('Edit'),
  },
  {
    value: 'preview',
    label: t('Preview'),
  },
];

export default class MarkdownModeDropdown extends PureComponent<MarkdownModeDropdownProps> {
  render() {
    const { id, value, onChange } = this.props;

    return (
      <PopoverDropdown
        data-test="markdown-mode-dropdown"
        id={id}
        options={dropdownOptions}
        value={value}
        onChange={onChange}
      />
    );
  }
}
