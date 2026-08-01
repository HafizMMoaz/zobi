import { SearchOption } from '../../types';
import { StyledSelect } from '../../styles';

interface SearchSelectDropdownProps {
  /** The currently selected search column value */
  value?: string;
  /** Callback triggered when a new search column is selected */
  onChange: (searchCol: string) => void;
  /** Available search column options to populate the dropdown */
  searchOptions: SearchOption[];
}

function SearchSelectDropdown({
  value,
  onChange,
  searchOptions,
}: SearchSelectDropdownProps) {
  return (
    <StyledSelect
      className="search-select"
      value={value || (searchOptions?.[0]?.value ?? '')}
      options={searchOptions}
      onChange={onChange}
    />
  );
}

export default SearchSelectDropdown;
