import { useMemo } from 'react';
import {
  BaseFormData,
  QueryData,
  SuperChart,
  ContextMenuFilters,
} from '@zobi.dev/core';
import { css } from '@zobi.dev/extension-api/theme';
import { Dataset } from '../types';

interface DrillByChartProps {
  formData: BaseFormData & { [key: string]: any };
  result: QueryData[];
  dataset: Dataset;
  onContextMenu: (
    offsetX: number,
    offsetY: number,
    filters: ContextMenuFilters,
  ) => void;
  inContextMenu: boolean;
}

export default function DrillByChart({
  formData,
  result,
  dataset,
  onContextMenu,
  inContextMenu,
}: DrillByChartProps) {
  const hooks = useMemo(() => ({ onContextMenu }), [onContextMenu]);

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        min-height: 0;
      `}
      data-test="drill-by-chart"
    >
      <SuperChart
        disableErrorBoundary
        chartType={formData.viz_type}
        enableNoResults
        datasource={dataset}
        formData={formData}
        queriesData={result}
        hooks={hooks}
        inContextMenu={inContextMenu}
        height="100%"
        width="100%"
      />
    </div>
  );
}
