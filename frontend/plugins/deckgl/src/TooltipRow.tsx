type TooltipRowProps = {
  label: string;
  value: string;
};

const TooltipRow = ({ label, value }: TooltipRowProps) => (
  <div>
    {label}
    <strong>{value}</strong>
  </div>
);

export default TooltipRow;
