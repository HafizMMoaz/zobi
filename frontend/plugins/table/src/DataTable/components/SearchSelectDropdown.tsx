/* eslint-disable import/no-extraneous-dependencies */
import { styled } from '@zobi.dev/extension-api/theme';
import { RawAntdSelect } from '@zobi.dev/core/components';
import { SearchOption } from '../../types';

const StyledSelect = styled(RawAntdSelect)`
  width: 120px;
  margin-right: 8px;
`;

interface SearchSelectDropdownProps {
  /** The currently selected search column value */
  value?: string;
  /** Function triggered when a new search column is selected */
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
      onChange={value => onChange(String(value))}
    />
  );
}

export default SearchSelectDropdown;
