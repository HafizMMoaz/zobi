import { RefObject, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { useSelector } from 'react-redux';
import { Metric } from '@zobi.dev/core';
import { css, styled, useTheme } from '@zobi.dev/extension-api/theme';
import { ColumnMeta } from '@zobi.dev/chart-controls';
import { DndItemType } from 'src/explore/components/DndItemType';
import {
  StyledColumnOption,
  StyledMetricOption,
} from 'src/explore/components/optionRenderers';
import { Icons } from '@zobi.dev/core/components/Icons';
import { ExplorePageState } from 'src/explore/types';

import { DatasourcePanelDndItem } from '../types';

const DatasourceItemContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: ${theme.sizeUnit * 6}px;
    padding: 0 ${theme.sizeUnit}px;

    // hack to make the drag preview image corners rounded
    transform: translate(0, 0);
    color: ${theme.colorText};
    background-color: ${theme.colorBgLayout};
    border-radius: 4px;

    &:hover {
      background-color: ${theme.colorPrimaryBgHover};
    }

    > div {
      min-width: 0;
      margin-right: ${theme.sizeUnit * 2}px;
    }
  `}
`;

interface DatasourcePanelDragOptionProps extends DatasourcePanelDndItem {
  labelRef?: RefObject<any>;
  showTooltip?: boolean;
}

type MetricOption = Omit<Metric, 'id'> & {
  label?: string;
};

export default function DatasourcePanelDragOption(
  props: DatasourcePanelDragOptionProps,
) {
  const { labelRef, showTooltip, type, value } = props;
  const theme = useTheme();

  // Read compatibility lists from Redux.
  // `null` means no filtering is active (SQL datasets, or no selection yet).
  const compatibleMetrics = useSelector<
    ExplorePageState,
    string[] | null | undefined
  >(state => state.explore.compatibleMetrics);
  const compatibleDimensions = useSelector<
    ExplorePageState,
    string[] | null | undefined
  >(state => state.explore.compatibleDimensions);

  // An item is compatible when the list is null (no filter) or when its
  // name explicitly appears in the list returned by the backend.
  const isCompatible = useMemo(() => {
    if (type === DndItemType.Metric) {
      if (!compatibleMetrics) return true;
      return compatibleMetrics.includes((value as Metric).metric_name);
    }
    if (type === DndItemType.Column) {
      if (!compatibleDimensions) return true;
      return compatibleDimensions.includes((value as ColumnMeta).column_name);
    }
    return true;
  }, [type, value, compatibleMetrics, compatibleDimensions]);

  const [{ isDragging }, drag] = useDrag({
    item: {
      value: props.value,
      type: props.type,
    },
    canDrag: isCompatible,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const optionProps = {
    labelRef,
    showTooltip: !isDragging && showTooltip,
    showType: true,
  };

  return (
    <DatasourceItemContainer
      data-test="DatasourcePanelDragOption"
      ref={drag}
      style={{
        opacity: isCompatible ? 1 : 0.35,
        cursor: isCompatible ? 'grab' : 'not-allowed',
      }}
    >
      {type === DndItemType.Column ? (
        <StyledColumnOption column={value as ColumnMeta} {...optionProps} />
      ) : (
        <StyledMetricOption metric={value as MetricOption} {...optionProps} />
      )}
      <Icons.Drag
        iconSize="xl"
        css={css`
          color: ${theme.colorFill};
          &hover {
            color: ${theme.colorIcon};
          }
        `}
      />
    </DatasourceItemContainer>
  );
}
