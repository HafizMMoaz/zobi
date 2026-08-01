
import { FC, ReactNode } from 'react';
import { InfoTooltip } from '@zobi.dev/core/components';
import { StyledFormItem } from './styles';

interface StyledFormItemWithTipProps {
  label: string;
  tip: string;
  name: string;
  children: ReactNode;
  rules?: any[];
}

const StyledFormItemWithTip: FC<StyledFormItemWithTipProps> = ({
  label,
  tip,
  children,
  name,
  rules,
}) => (
  <StyledFormItem
    label={
      <div>
        {label}
        <InfoTooltip tooltip={tip} />
      </div>
    }
    name={name}
    rules={rules}
  >
    {children}
  </StyledFormItem>
);

export default StyledFormItemWithTip;
