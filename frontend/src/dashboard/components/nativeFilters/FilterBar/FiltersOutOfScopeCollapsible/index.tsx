import { ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { Divider, Filter } from '@zobi-ui/core';
import { css, ZobiTheme } from '@zobi/core/theme';
import { Collapse } from '@zobi-ui/core/components';

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
