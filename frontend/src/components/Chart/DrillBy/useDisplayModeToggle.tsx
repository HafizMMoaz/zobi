
import { useMemo, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Radio } from '@zobi.dev/core/components/Radio';
import { DrillByType } from '../types';

export const useDisplayModeToggle = () => {
  const [drillByDisplayMode, setDrillByDisplayMode] = useState<DrillByType>(
    DrillByType.Chart,
  );

  const displayModeToggle = useMemo(
    () => (
      <div
        css={(theme: ZobiTheme) => css`
          margin-bottom: ${theme.sizeUnit * 6}px;
        `}
        data-test="drill-by-display-toggle"
      >
        <Radio.GroupWrapper
          onChange={({ target: { value } }) => {
            setDrillByDisplayMode(value);
          }}
          defaultValue={DrillByType.Chart}
          options={[
            { label: t('Chart'), value: DrillByType.Chart },
            { label: t('Table'), value: DrillByType.Table },
          ]}
          optionType="button"
          buttonStyle="outline"
        />
      </div>
    ),
    [],
  );
  return { displayModeToggle, drillByDisplayMode };
};
