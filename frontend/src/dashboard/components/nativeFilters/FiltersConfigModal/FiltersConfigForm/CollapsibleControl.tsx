import { ReactNode, useEffect, useState } from 'react';
import { styled } from '@zobi.dev/extension-api/theme';
import { Checkbox, InfoTooltip } from '@zobi.dev/core/components';

interface CollapsibleControlProps {
  initialValue?: boolean;
  disabled?: boolean;
  checked?: boolean;
  title: ReactNode;
  tooltip?: string;
  children: ReactNode;
  onChange?: (checked: boolean) => void;
}

const StyledContainer = styled.div<{ checked: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  & > div {
    margin-bottom: ${({ theme }) => theme.sizeUnit * 2}px;
  }
`;

const ChildrenContainer = styled.div`
  margin-left: ${({ theme }) => theme.sizeUnit * 6}px;
`;

const CollapsibleControl = (props: CollapsibleControlProps) => {
  const {
    checked,
    disabled,
    title,
    tooltip,
    children,
    onChange = () => {},
    initialValue = false,
  } = props;
  const [isChecked, setIsChecked] = useState(initialValue);

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  return (
    <StyledContainer checked={isChecked}>
      <Checkbox
        checked={isChecked}
        disabled={disabled}
        onChange={e => {
          const value = e.target.checked;
          if (checked === undefined) {
            setIsChecked(value);
          }
          onChange(value);
        }}
      >
        <>
          {title}&nbsp;
          {tooltip && <InfoTooltip placement="top" tooltip={tooltip} />}
        </>
      </Checkbox>
      {isChecked && <ChildrenContainer>{children}</ChildrenContainer>}
    </StyledContainer>
  );
};

export { CollapsibleControl, CollapsibleControlProps };
