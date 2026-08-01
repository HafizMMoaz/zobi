import { useState, FC } from 'react';

import { t } from '@zobi/core-legacy/translation';
import { Icons } from '@zobi-ui/core/components/Icons';
import { Label } from '../Label';
import { Tooltip } from '../Tooltip';
import { TooltipContent } from './TooltipContent';
import type { CacheLabelProps } from './types';

export const CachedLabel: FC<CacheLabelProps> = ({
  className,
  onClick,
  cachedTimestamp,
}) => {
  const [hovered, setHovered] = useState(false);

  const labelType = hovered ? 'info' : 'default';
  return (
    <Tooltip
      title={<TooltipContent cachedTimestamp={cachedTimestamp} />}
      id="cache-desc-tooltip"
    >
      <Label
        className={`${className}`}
        type={labelType}
        onClick={onClick}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        icon={<Icons.SyncOutlined iconSize="m" />}
      >
        {t('Cached')}
      </Label>
    </Tooltip>
  );
};

export type { CacheLabelProps };
