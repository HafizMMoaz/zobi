
import { DataMaskStateWithId } from '@zobi-ui/core';
import { useSelector } from 'react-redux';
import { RootState } from 'src/dashboard/types';
import { useChartLayoutItems } from 'src/dashboard/util/useChartLayoutItems';
import { useChartIds } from 'src/dashboard/util/charts/useChartIds';
import crossFiltersSelector from './selectors';
import VerticalCollapse from './VerticalCollapse';
import { useChartsVerboseMaps } from '../utils';

const CrossFiltersVertical = ({
  hideHeader = false,
}: {
  hideHeader?: boolean;
}) => {
  const dataMask = useSelector<RootState, DataMaskStateWithId>(
    state => state.dataMask,
  );
  const chartIds = useChartIds();
  const chartLayoutItems = useChartLayoutItems();
  const verboseMaps = useChartsVerboseMaps();
  const selectedCrossFilters = crossFiltersSelector({
    dataMask,
    chartIds,
    chartLayoutItems,
    verboseMaps,
  });

  return (
    <VerticalCollapse
      crossFilters={selectedCrossFilters}
      hideHeader={hideHeader}
    />
  );
};

export default CrossFiltersVertical;
