import { useCallback } from 'react';
import {
  BinaryQueryObjectFilterClause,
  getColumnLabel,
  getNumberFormatter,
  getTimeFormatter,
} from '@zobi-ui/core';
import { SunburstTransformedProps } from './types';
import Echart from '../components/Echart';
import { EventHandlers, TreePathInfo } from '../types';
import { formatSeriesName } from '../utils/series';

export const extractTreePathInfo = (treePathInfo: TreePathInfo[] | undefined) =>
  (treePathInfo ?? [])
    .map(pathInfo => pathInfo?.name || '')
    .filter(path => path !== '');

export default function EchartsSunburst(props: SunburstTransformedProps) {
  const {
    height,
    width,
    echartOptions,
    setDataMask,
    selectedValues,
    formData,
    onContextMenu,
    refs,
    emitCrossFilters,
    coltypeMapping,
  } = props;
  const { columns } = formData;

  const getCrossFilterDataMask = useCallback(
    (treePathInfo: TreePathInfo[]) => {
      const treePath = extractTreePathInfo(treePathInfo);
      const joinedTreePath = treePath.join(',');
      const value = treePath[treePath.length - 1];

      const isCurrentValueSelected =
        Object.values(selectedValues).includes(joinedTreePath);

      if (!columns?.length || isCurrentValueSelected) {
        return {
          dataMask: {
            extraFormData: {
              filters: [],
            },
            filterState: {
              value: null,
              selectedValues: [],
            },
          },
          isCurrentValueSelected,
        };
      }

      return {
        dataMask: {
          extraFormData: {
            filters: [
              {
                col: columns[treePath.length - 1],
                op: '==' as const,
                val: value,
              },
            ],
          },
          filterState: {
            value,
            selectedValues: [joinedTreePath],
          },
        },
        isCurrentValueSelected,
      };
    },
    [columns, selectedValues],
  );

  const handleChange = useCallback(
    (treePathInfo: TreePathInfo[]) => {
      if (!emitCrossFilters || !columns?.length) {
        return;
      }

      setDataMask(getCrossFilterDataMask(treePathInfo).dataMask);
    },
    [emitCrossFilters, columns?.length, setDataMask, getCrossFilterDataMask],
  );

  const eventHandlers: EventHandlers = {
    click: props => {
      const { treePathInfo } = props;
      handleChange(treePathInfo);
    },
    contextmenu: async eventParams => {
      if (onContextMenu) {
        eventParams.event.stop();
        const { data, treePathInfo } = eventParams;
        const { records } = data;
        const treePath = extractTreePathInfo(eventParams.treePathInfo);
        const pointerEvent = eventParams.event.event;
        const drillToDetailFilters: BinaryQueryObjectFilterClause[] = [];
        const drillByFilters: BinaryQueryObjectFilterClause[] = [];
        if (columns?.length) {
          treePath.forEach((path, i) =>
            drillToDetailFilters.push({
              col: columns[i],
              op: '==',
              val: records[i],
              formattedVal: path,
            }),
          );
          const val = treePath[treePath.length - 1];
          drillByFilters.push({
            col: columns[treePath.length - 1],
            op: '==',
            val,
            formattedVal: formatSeriesName(val, {
              timeFormatter: getTimeFormatter(formData.dateFormat),
              numberFormatter: getNumberFormatter(formData.numberFormat),
              coltype:
                coltypeMapping?.[getColumnLabel(columns[treePath.length - 1])],
            }),
          });
        }
        onContextMenu(pointerEvent.clientX, pointerEvent.clientY, {
          drillToDetail: drillToDetailFilters,
          crossFilter: columns?.length
            ? getCrossFilterDataMask(treePathInfo)
            : undefined,
          drillBy: { filters: drillByFilters, groupbyFieldName: 'columns' },
        });
      }
    },
  };

  return (
    <Echart
      refs={refs}
      height={height}
      width={width}
      echartOptions={echartOptions}
      eventHandlers={eventHandlers}
      selectedValues={selectedValues}
      vizType={formData.vizType}
    />
  );
}
