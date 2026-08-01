
import { t } from '@zobi/core/translation';
import { detectOS } from 'src/utils/common';

export const getSliceHeaderTooltip = (sliceName: string | undefined) => {
  const isMac = detectOS() === 'MacOS';
  const firstLine = sliceName
    ? t('Click to edit %s.', sliceName)
    : t('Click to edit chart.');
  const secondLine = t(
    'Use %s to open in a new tab.',
    isMac ? t('⌘ + click') : t('ctrl + click'),
  );
  return (
    <>
      <div>{firstLine}</div>
      <div>{secondLine}</div>
    </>
  );
};
