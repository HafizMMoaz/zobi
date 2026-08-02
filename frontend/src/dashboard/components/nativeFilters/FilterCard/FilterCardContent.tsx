import { ScopeRow } from './ScopeRow';
import { DependenciesRow } from './DependenciesRow';
import { NameRow } from './NameRow';
import { TypeRow } from './TypeRow';
import { FilterElement } from '../FilterBar/FilterControls/types';

interface FilterCardContentProps {
  filter: FilterElement;
  hidePopover: () => void;
}

export const FilterCardContent = ({
  filter,
  hidePopover,
}: FilterCardContentProps) => (
  <div>
    <NameRow filter={filter} hidePopover={hidePopover} />
    <TypeRow filter={filter} />
    <ScopeRow filter={filter} />
    <DependenciesRow filter={filter} />
  </div>
);
