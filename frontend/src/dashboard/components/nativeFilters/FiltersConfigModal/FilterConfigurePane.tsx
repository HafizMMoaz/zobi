import { FC, ReactNode } from 'react';
import { NativeFilterType } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import FilterTitlePane from './FilterTitlePane';
import { FilterRemoval } from './types';

interface Props {
  children?: ReactNode;
  getFilterTitle: (filterId: string) => string;
  onChange: (activeKey: string) => void;
  onAdd: (type: NativeFilterType) => void;
  onRemove: (id: string) => void;
  onRearrange: (dragIndex: number, targetIndex: number) => void;
  erroredFilters: string[];
  restoreFilter: (id: string) => void;
  currentFilterId: string;
  filters: string[];
  removedFilters: Record<string, FilterRemoval>;
}

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const ContentHolder = styled.div`
  flex-grow: 3;
`;

const TitlesContainer = styled.div`
  min-width: 290px;
  max-width: 290px;
  border-right: 1px solid ${({ theme }) => theme.colorSplit};
`;

const FilterConfigurePane: FC<Props> = ({
  getFilterTitle,
  onChange,
  onRemove,
  onRearrange,
  restoreFilter,
  onAdd,
  erroredFilters,
  children,
  currentFilterId,
  filters,
  removedFilters,
}) => (
  <Container>
    <TitlesContainer>
      <FilterTitlePane
        currentFilterId={currentFilterId}
        filters={filters}
        removedFilters={removedFilters}
        erroredFilters={erroredFilters}
        getFilterTitle={getFilterTitle}
        onChange={onChange}
        onAdd={(type: NativeFilterType) => onAdd(type)}
        onRearrange={onRearrange}
        onRemove={(id: string) => onRemove(id)}
        restoreFilter={restoreFilter}
      />
    </TitlesContainer>
    <ContentHolder>{children}</ContentHolder>
  </Container>
);

export default FilterConfigurePane;
