import { useMemo } from 'react';
import { t } from '@zobi/core/translation';
import {
  getChartMetadataRegistry,
  isChartCustomization,
} from '@zobi-ui/core';
import { Row, RowLabel, RowValue } from './Styles';
import { FilterCardRowProps } from './types';

export const TypeRow = ({ filter }: FilterCardRowProps) => {
  const isCustomization = isChartCustomization(filter);
  const metadata = useMemo(
    () => getChartMetadataRegistry().get(filter.filterType),
    [filter.filterType],
  );
  return (
    <Row>
      <RowLabel>{isCustomization ? t('Type') : t('Filter type')}</RowLabel>
      <RowValue>{metadata?.name}</RowValue>
    </Row>
  );
};
