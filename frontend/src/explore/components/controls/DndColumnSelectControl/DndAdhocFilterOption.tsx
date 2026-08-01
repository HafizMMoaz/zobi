import { t } from '@zobi.dev/extension-api/translation';
import { DndItemType } from 'src/explore/components/DndItemType';
import AdhocFilterPopoverTrigger from 'src/explore/components/controls/FilterControl/AdhocFilterPopoverTrigger';
import AdhocFilter from 'src/explore/components/controls/FilterControl/AdhocFilter';
import { OptionSortType } from 'src/explore/types';
import { useGetTimeRangeLabel } from 'src/explore/components/controls/FilterControl/utils';
import OptionWrapper from './OptionWrapper';
import { datasetLabelLower } from 'src/features/semanticLayers/label';

export interface DndAdhocFilterOptionProps {
  adhocFilter: AdhocFilter;
  onFilterEdit: (changedFilter: AdhocFilter) => void;
  onClickClose: (index: number) => void;
  onShiftOptions: (dragIndex: number, hoverIndex: number) => void;
  options: OptionSortType[];
  datasource: Record<string, any>;
  partitionColumn?: string;
  index: number;
}

export default function DndAdhocFilterOption({
  adhocFilter,
  options,
  datasource,
  onFilterEdit,
  onShiftOptions,
  onClickClose,
  partitionColumn,
  index,
}: DndAdhocFilterOptionProps) {
  const { actualTimeRange, title } = useGetTimeRangeLabel(adhocFilter);

  return (
    <AdhocFilterPopoverTrigger
      key={index}
      adhocFilter={adhocFilter}
      options={options}
      datasource={datasource}
      onFilterEdit={onFilterEdit}
      partitionColumn={partitionColumn}
    >
      <OptionWrapper
        key={index}
        index={index}
        label={actualTimeRange ?? adhocFilter.getDefaultLabel()}
        tooltipTitle={title ?? adhocFilter.getTooltipTitle()}
        clickClose={onClickClose}
        onShiftOptions={onShiftOptions}
        type={DndItemType.FilterOption}
        withCaret
        isExtra={adhocFilter.isExtra}
        datasourceWarningMessage={
          adhocFilter.datasourceWarning
            ? t(
                'This filter might be incompatible with current %s',
                datasetLabelLower(),
              )
            : undefined
        }
      />
    </AdhocFilterPopoverTrigger>
  );
}
