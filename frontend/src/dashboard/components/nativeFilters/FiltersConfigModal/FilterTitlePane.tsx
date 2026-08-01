import { useRef, FC } from 'react';

import { t } from '@zobi/core/translation';
import { NativeFilterType } from '@zobi-ui/core';
import { styled, useTheme } from '@zobi/core/theme';
import { Button } from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';

import FilterTitleContainer from './FilterTitleContainer';
import { FilterRemoval } from './types';

interface Props {
  restoreFilter: (id: string) => void;
  getFilterTitle: (id: string) => string;
  onRearrange: (dragIndex: number, targetIndex: number) => void;
  onRemove: (id: string) => void;
  onChange: (id: string) => void;
  onAdd: (type: NativeFilterType) => void;
  removedFilters: Record<string, FilterRemoval>;
  currentFilterId: string;
  filters: string[];
  erroredFilters: string[];
}

const TabsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.sizeUnit * 3}px;
  padding-top: 2px;
`;

const FilterTitlePane: FC<Props> = ({
  getFilterTitle,
  onChange,
  onAdd,
  onRemove,
  onRearrange,
  restoreFilter,
  currentFilterId,
  filters,
  removedFilters,
  erroredFilters,
}) => {
  const theme = useTheme();

  const filtersContainerRef = useRef<HTMLDivElement>(null);

  const handleOnAdd = (type: NativeFilterType) => {
    onAdd(type);
    setTimeout(() => {
      filtersContainerRef?.current?.scroll?.({
        top: filtersContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 0);
  };
  return (
    <TabsContainer>
      <div
        css={{
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <FilterTitleContainer
          ref={filtersContainerRef}
          filters={filters}
          currentFilterId={currentFilterId}
          removedFilters={removedFilters}
          getFilterTitle={getFilterTitle}
          erroredFilters={erroredFilters}
          onChange={onChange}
          onRemove={onRemove}
          onRearrange={onRearrange}
          restoreFilter={restoreFilter}
        />
      </div>
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          paddingTop: theme.sizeUnit * 3,
          position: 'sticky',
          bottom: theme.sizeUnit * 3,
        }}
      >
        <Button
          buttonSize="default"
          buttonStyle="secondary"
          icon={
            <Icons.FilterOutlined iconColor={theme.colorPrimary} iconSize="m" />
          }
          data-test="add-new-filter-button"
          onClick={() => handleOnAdd(NativeFilterType.NativeFilter)}
        >
          {t('Add filter')}
        </Button>
        <Button
          buttonSize="default"
          buttonStyle="secondary"
          icon={
            <Icons.PicCenterOutlined
              iconColor={theme.colorPrimary}
              iconSize="m"
            />
          }
          data-test="add-new-divider-button"
          onClick={() => handleOnAdd(NativeFilterType.Divider)}
        >
          {t('Add divider')}
        </Button>
      </div>
    </TabsContainer>
  );
};

export default FilterTitlePane;
