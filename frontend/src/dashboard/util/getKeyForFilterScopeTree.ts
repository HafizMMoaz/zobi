import { safeStringify } from '../../utils/safeStringify';

interface GetKeyForFilterScopeTreeProps {
  activeFilterField?: string;
  checkedFilterFields: string[];
}

export default function getKeyForFilterScopeTree({
  activeFilterField,
  checkedFilterFields,
}: GetKeyForFilterScopeTreeProps): string {
  return safeStringify(
    activeFilterField ? [activeFilterField] : checkedFilterFields,
  );
}
