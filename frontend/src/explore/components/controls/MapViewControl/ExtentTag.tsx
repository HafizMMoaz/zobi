import { t } from '@zobi.dev/extension-api/translation';
import { Tag } from 'src/components';
import { FC } from 'react';
import { ExtentTagProps } from './types';

export const ExtentTag: FC<ExtentTagProps> = ({
  value,
  onClick,
  className,
}) => {
  const unsetName = t('unset');
  const zoomName = t('Zoom');
  const latName = t('Lat');
  const lonName = t('Lon');

  return (
    <Tag onClick={onClick} className={className}>
      {zoomName}: {value.fixedZoom ? Math.round(value.fixedZoom) : unsetName}
      {' | '}
      {latName}:{' '}
      {value.fixedLatitude ? value.fixedLatitude.toFixed(6) : unsetName}
      {' | '}
      {lonName}:{' '}
      {value.fixedLongitude ? value.fixedLongitude.toFixed(6) : unsetName}
    </Tag>
  );
};

export default ExtentTag;
