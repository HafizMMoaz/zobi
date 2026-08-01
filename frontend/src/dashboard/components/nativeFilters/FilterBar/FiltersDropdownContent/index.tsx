
import { ReactNode } from 'react';
import { Divider, Filter } from '@zobi.dev/core';
import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { FilterBarOrientation } from 'src/dashboard/types';
import { FiltersOutOfScopeCollapsible } from '../FiltersOutOfScopeCollapsible';
import { CrossFilterIndicator } from '../../selectors';

export interface FiltersDropdownContentProps {
  overflowedCrossFilters: CrossFilterIndicator[];
  filtersInScope: (Filter | Divider)[];
  filtersOutOfScope: (Filter | Divider)[];
  renderer: (filter: Filter | Divider, index: number) => ReactNode;
  rendererCrossFilter: (
    crossFilter: CrossFilterIndicator,
    orientation: FilterBarOrientation.Vertical,
    last: CrossFilterIndicator,
  ) => ReactNode;
  showCollapsePanel?: boolean;
  forceRenderOutOfScope?: boolean;
}

export const FiltersDropdownContent = ({
  overflowedCrossFilters,
  filtersInScope,
  filtersOutOfScope,
  renderer,
  rendererCrossFilter,
  showCollapsePanel,
  forceRenderOutOfScope,
}: FiltersDropdownContentProps) => (
  <div
    css={(theme: ZobiTheme) => css`
      width: ${theme.sizeUnit * 56}px;
      padding: ${theme.sizeUnit}px 0;
    `}
  >
    {overflowedCrossFilters.map(crossFilter =>
      rendererCrossFilter(
        crossFilter,
        FilterBarOrientation.Vertical,
        overflowedCrossFilters.at(-1) as CrossFilterIndicator,
      ),
    )}
    {filtersInScope.map(renderer)}
    {showCollapsePanel && filtersOutOfScope.length > 0 && (
      <FiltersOutOfScopeCollapsible
        filtersOutOfScope={filtersOutOfScope}
        renderer={renderer}
        forceRender={forceRenderOutOfScope}
      />
    )}
  </div>
);
