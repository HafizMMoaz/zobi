
import { useEffect, useState } from 'react';
import { Popover } from '@zobi.dev/core/components';
import { FilterCardContent } from './FilterCardContent';
import { FilterCardProps } from './types';

export const FilterCard = ({
  children,
  filter,
  getPopupContainer,
  isVisible: externalIsVisible = true,
  placement,
}: FilterCardProps) => {
  const [internalIsVisible, setInternalIsVisible] = useState(false);
  const hidePopover = () => {
    setInternalIsVisible(false);
  };

  useEffect(() => {
    if (!externalIsVisible) {
      setInternalIsVisible(false);
    }
  }, [externalIsVisible]);
  return (
    <Popover
      placement={placement}
      overlayStyle={{
        width: '240px',
      }}
      mouseEnterDelay={0.2}
      mouseLeaveDelay={0.2}
      onOpenChange={visible => {
        setInternalIsVisible(externalIsVisible && visible);
      }}
      open={externalIsVisible && internalIsVisible}
      content={<FilterCardContent filter={filter} hidePopover={hidePopover} />}
      getPopupContainer={getPopupContainer ?? (() => document.body)}
      arrow={false}
    >
      {children}
    </Popover>
  );
};
