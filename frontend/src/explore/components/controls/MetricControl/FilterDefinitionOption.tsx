import { StyledColumnOption } from '../../optionRenderers';

interface OptionType {
  saved_metric_name?: string;
  column_name?: string;
  label?: string;
  type?: string;
  [key: string]: unknown;
}

export default function FilterDefinitionOption({
  option,
}: {
  option: OptionType;
}) {
  if (option.saved_metric_name) {
    return (
      <StyledColumnOption
        column={{ column_name: option.saved_metric_name, type: 'metric' }}
        showType
      />
    );
  }
  if (option.column_name) {
    return (
      <StyledColumnOption
        column={option as { column_name: string; type?: string }}
        showType
      />
    );
  }
  if (option.label) {
    return (
      <StyledColumnOption
        column={{ column_name: option.label, type: 'metric' }}
        showType
      />
    );
  }
  return null;
}
