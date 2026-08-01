import { ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import {
  ChartCustomization,
  ChartCustomizationDivider,
} from '@zobi.dev/core';
import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Collapse } from '@zobi.dev/core/components';

export interface CustomizationsOutOfScopeCollapsibleProps {
  customizationsOutOfScope: (ChartCustomization | ChartCustomizationDivider)[];
  renderer: (
    customization: ChartCustomization | ChartCustomizationDivider,
    index: number,
  ) => ReactNode;
  forceRender?: boolean;
}

export const CustomizationsOutOfScopeCollapsible = ({
  customizationsOutOfScope,
  renderer,
  forceRender = false,
}: CustomizationsOutOfScopeCollapsibleProps) => (
  <Collapse
    ghost
    bordered
    expandIconPosition="end"
    collapsible={customizationsOutOfScope.length === 0 ? 'disabled' : undefined}
    items={[
      {
        key: 'out-of-scope-customizations',
        label: (
          <span
            css={(theme: ZobiTheme) => css`
              font-size: ${theme.fontSizeSM}px;
            `}
          >
            {t(
              'Customizations out of scope (%d)',
              customizationsOutOfScope.length,
            )}
          </span>
        ),
        children: customizationsOutOfScope.map(renderer),
        forceRender,
      },
    ]}
  />
);
