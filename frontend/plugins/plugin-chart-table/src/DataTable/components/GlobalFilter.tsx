import {
  memo,
  ComponentType,
  ChangeEventHandler,
  useRef,
  useEffect,
  Ref,
} from 'react';
import { Row, FilterValue } from 'react-table';
import { t, tn } from '@zobi/core/translation';
import { Input, type InputRef, Space } from '@zobi-ui/core/components';
import useAsyncState from '../utils/useAsyncState';

export interface SearchInputProps {
  count: number;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: () => void;
  inputRef?: Ref<InputRef>;
}

const isSearchFocused = new Map();

export interface GlobalFilterProps<D extends object> {
  preGlobalFilteredRows: Row<D>[];
  // filter value cannot be `undefined` otherwise React will report component
  // control type undefined error
  filterValue: string;
  setGlobalFilter: (filterValue: FilterValue) => void;
  searchInput?: ComponentType<SearchInputProps>;
  id?: string;
  serverPagination: boolean;
  rowCount: number;
}

function DefaultSearchInput({
  count,
  value,
  onChange,
  onBlur,
  inputRef,
}: SearchInputProps) {
  return (
    <Space direction="horizontal" size={4} className="dt-global-filter">
      {t('Search')}
      <Input
        size="small"
        ref={inputRef}
        placeholder={tn('%s record...', '%s records...', count, count)}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="form-control input-sm"
      />
    </Space>
  );
}

export default (memo as <T>(fn: T) => T)(function GlobalFilter<
  D extends object,
>({
  preGlobalFilteredRows,
  filterValue = '',
  searchInput,
  setGlobalFilter,
  id = '',
  serverPagination,
  rowCount,
}: GlobalFilterProps<D>) {
  const count = serverPagination ? rowCount : preGlobalFilteredRows.length;
  const inputRef = useRef<InputRef>(null);

  const [value, setValue] = useAsyncState(
    filterValue,
    (newValue: string) => {
      setGlobalFilter(newValue || undefined);
    },
    200,
  );

  // Preserve focus during server-side filtering to maintain a better user experience
  useEffect(() => {
    if (
      serverPagination &&
      isSearchFocused.get(id) &&
      document.activeElement !== inputRef.current
    ) {
      inputRef.current?.focus();
    }
  }, [value, serverPagination]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    e.preventDefault();
    isSearchFocused.set(id, true);
    setValue(target.value);
  };

  const handleBlur = () => {
    isSearchFocused.set(id, false);
  };

  const SearchInput = searchInput || DefaultSearchInput;

  return (
    <SearchInput
      count={count}
      value={value}
      inputRef={inputRef}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});
