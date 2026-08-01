

import { memo, ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
};

const CONTAINER_STYLE = { padding: 8 };

function TooltipFrame({ className = '', children }: Props) {
  return (
    <div className={className} style={CONTAINER_STYLE}>
      {children}
    </div>
  );
}

export default memo(TooltipFrame);
