import { useEffect, useState } from 'react';
import { NO_TIME_RANGE, fetchTimeRange } from '@zobi-ui/core';
import { Operators } from 'src/explore/constants';
import AdhocFilter from '../AdhocFilter';
import { ExpressionTypes } from '../types';

interface Results {
  actualTimeRange?: string;
  title?: string;
}

export const useGetTimeRangeLabel = (adhocFilter: AdhocFilter): Results => {
  const [actualTimeRange, setActualTimeRange] = useState<Results>({});

  useEffect(() => {
    if (
      adhocFilter.operator !== Operators.TemporalRange ||
      adhocFilter.expressionType !== ExpressionTypes.Simple
    ) {
      setActualTimeRange({});
    }
    if (
      adhocFilter.operator === Operators.TemporalRange &&
      adhocFilter.comparator === NO_TIME_RANGE
    ) {
      setActualTimeRange({
        actualTimeRange: `${adhocFilter.subject} (${NO_TIME_RANGE})`,
        title: NO_TIME_RANGE,
      });
    }

    if (
      adhocFilter.operator === Operators.TemporalRange &&
      adhocFilter.expressionType === ExpressionTypes.Simple &&
      adhocFilter.comparator !== NO_TIME_RANGE &&
      actualTimeRange.title !== adhocFilter.comparator
    ) {
      fetchTimeRange(
        adhocFilter.comparator as string,
        adhocFilter.subject as string,
      ).then(({ value, error }) => {
        if (error) {
          setActualTimeRange({
            actualTimeRange: `${adhocFilter.subject} (${adhocFilter.comparator})`,
            title: error,
          });
        } else {
          setActualTimeRange({
            actualTimeRange: value ?? '',
            title: adhocFilter.comparator as string | undefined,
          });
        }
      });
    }
  }, [adhocFilter]);

  return actualTimeRange;
};
