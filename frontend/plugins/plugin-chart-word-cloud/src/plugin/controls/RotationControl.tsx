import { t } from '@zobi/core/translation';
import { Select, SelectValue } from '@zobi-ui/core/components';
import { ControlHeader } from '@zobi-ui/chart-controls';
import { ControlComponentProps } from '@zobi-ui/chart-controls';

type RotationControlProps = ControlComponentProps<string> & {
  choices?: [string, string][];
  clearable?: boolean;
};

export default function RotationControl({
  name = 'rotation',
  value,
  onChange,
  choices = [
    ['random', t('random')],
    ['flat', t('flat')],
    ['square', t('square')],
  ],
  label = t('Word Rotation'),
  description = t('Rotation to apply to words in the cloud'),
  renderTrigger = true,
  clearable = false,
}: RotationControlProps) {
  return (
    <div className="Control" data-test={name}>
      <ControlHeader
        name={name}
        label={label}
        description={description}
        renderTrigger={renderTrigger}
      />
      <Select
        value={value ?? 'square'}
        options={choices.map(([key, text]) => ({ label: text, value: key }))}
        onChange={(val: SelectValue) => {
          if (val === null || val === undefined) {
            return;
          }
          // Handle LabeledValue object
          if (
            typeof val === 'object' &&
            'value' in val &&
            val.value !== undefined
          ) {
            onChange?.(val.value as string);
          } else if (typeof val === 'string' || typeof val === 'number') {
            // Handle raw value
            onChange?.(String(val));
          }
        }}
        allowClear={clearable}
      />
    </div>
  );
}

RotationControl.displayName = 'RotationControl';
