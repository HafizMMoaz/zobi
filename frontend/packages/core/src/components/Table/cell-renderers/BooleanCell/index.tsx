import { Constants } from '@zobi.dev/core/components';

export interface BooleanCellProps {
  value?: boolean;
}

function BooleanCell({ value }: BooleanCellProps) {
  return (
    <span>
      {value ? Constants.BOOL_TRUE_DISPLAY : Constants.BOOL_FALSE_DISPLAY}
    </span>
  );
}

export default BooleanCell;
