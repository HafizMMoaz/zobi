import { formatNumber } from '@zobi-ui/core';
import { parseToNumber } from '../../utils';

interface FormattedNumberProps {
  num?: string | number | null;
  format?: string;
}

const FormattedNumber = ({ num = 0, format }: FormattedNumberProps) => {
  const displayNum = num ?? 0;
  const numericValue = parseToNumber(num);

  if (format)
    return (
      <span title={`${displayNum}`}>{formatNumber(format, numericValue)}</span>
    );

  return <span>{displayNum}</span>;
};

export default FormattedNumber;
