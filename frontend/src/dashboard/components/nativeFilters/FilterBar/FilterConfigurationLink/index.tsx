import { ReactNode, FC, memo } from 'react';

import { getFilterBarTestId } from '../utils';

export interface FCBProps {
  onClick?: () => void;
  children?: ReactNode;
}

export const FilterConfigurationLink: FC<FCBProps> = ({
  onClick,
  children,
}) => (
  <div
    {...getFilterBarTestId('create-filter')}
    onClick={onClick}
    role="button"
    tabIndex={0}
  >
    {children}
  </div>
);

export default memo(FilterConfigurationLink);
