import { ChangeEvent, useCallback, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled, useTheme } from '@zobi.dev/extension-api/theme';
import { Input, Tooltip } from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';

interface DndColumnSelectPopoverTitleProps {
  title: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isEditDisabled: boolean;
  hasCustomLabel: boolean;
}

const StyledInput = styled(Input)`
  border-radius: ${({ theme }) => theme.borderRadius};
  height: 26px;
  padding-left: ${({ theme }) => theme.sizeUnit * 2.5}px;
  border-color: ${({ theme }) => theme.colorSplit};
`;

export const DndColumnSelectPopoverTitle = ({
  title,
  onChange,
  isEditDisabled,
  hasCustomLabel,
}: DndColumnSelectPopoverTitleProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const onMouseOver = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseOut = useCallback(() => {
    setIsHovered(false);
  }, []);

  const onClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const onInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value === '') {
        onChange(e);
      }
      onBlur();
    },
    [onBlur, onChange],
  );

  const defaultLabel = t('My column');

  if (isEditDisabled) {
    return <span>{title || defaultLabel}</span>;
  }

  return isEditMode ? (
    <StyledInput
      type="text"
      placeholder={title}
      value={hasCustomLabel ? title : ''}
      autoFocus
      onChange={onChange}
      onBlur={onInputBlur}
    />
  ) : (
    <Tooltip placement="top" title={t('Click to edit label')}>
      <span
        className="AdhocMetricEditPopoverTitle inline-editable"
        data-test="AdhocMetricEditTitle#trigger"
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
        onBlur={onBlur}
        role="button"
        tabIndex={0}
      >
        {title || defaultLabel}
        &nbsp;
        <Icons.EditOutlined
          iconColor={isHovered ? theme.colorPrimary : theme.colorText}
          iconSize="m"
        />
      </span>
    </Tooltip>
  );
};
