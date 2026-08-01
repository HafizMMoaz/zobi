import { Button } from '../../../Button';
import { ButtonStyle, ButtonSize } from '../../../Button/types';

type onClickFunction = (row: object, index: number) => void;

export interface ButtonCellProps {
  label: string;
  onClick: onClickFunction;
  row: object;
  index: number;
  tooltip?: string;
  buttonStyle?: ButtonStyle;
  buttonSize?: ButtonSize;
}

export function ButtonCell(props: ButtonCellProps) {
  const {
    label,
    onClick,
    row,
    index,
    tooltip,
    buttonStyle = 'primary',
    buttonSize = 'small',
  } = props;

  return (
    <Button
      buttonStyle={buttonStyle}
      buttonSize={buttonSize}
      onClick={() => onClick?.(row, index)}
      key={`${buttonStyle}_${buttonSize}`}
      tooltip={tooltip}
    >
      {label}
    </Button>
  );
}

export default ButtonCell;
