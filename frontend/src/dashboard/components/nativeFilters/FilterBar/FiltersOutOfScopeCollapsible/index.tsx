import { ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Divider, Filter } from '@zobi.dev/core';
import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Collapse } from '@zobi.dev/core/components';

export interface FiltersOutOfScopeCollapsibleProps {
  filtersOutOfScope: (Filter | Divider)[];
  renderer: (filter: Filter | Divider, index: number) => ReactNode;
  forceRender?: boolean;
}

export const FiltersOutOfScopeCollapsible = ({
  filtersOutOfScope,
  renderer,
  forceRender = false,
}: FiltersOutOfScopeCollapsibleProps) => (
  <Collapse
    ghost
    bordered
    expandIconPosition="end"
    items={[
      {
        key: 'out-of-scope-filters',
        label: (
          <span
            css={(theme: ZobiTheme) => css`
              font-size: ${theme.fontSizeSM}px;
            `}
          >
            {t('Filters out of scope (%d)', filtersOutOfScope.length)}
          </span>
        ),
        children: filtersOutOfScope.map(renderer),
        forceRender,
      },
    ]}
  />
);
