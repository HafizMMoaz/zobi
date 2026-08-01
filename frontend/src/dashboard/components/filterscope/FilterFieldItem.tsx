import cx from 'classnames';
import { FormLabel } from '@zobi.dev/core/components';

interface FilterFieldItemProps {
  label: string;
  isSelected: boolean;
}

export default function FilterFieldItem({
  label,
  isSelected,
}: FilterFieldItemProps) {
  return (
    <span
      className={cx('filter-field-item filter-container', {
        'is-selected': isSelected,
      })}
    >
      <FormLabel htmlFor={label}>{label}</FormLabel>
    </span>
  );
}
