import { FunctionComponent } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { Select } from '@zobi.dev/core/components';
import { ChatModel } from './types';

export type ModelPickerProps = {
  models: ChatModel[];
  value: string | null;
  onChange: (alias: string | null) => void;
  label: string;
  disabled?: boolean;
};

/**
 * Choose which configured model answers.
 *
 * Used twice: once for a thread's persisted default and once for a one-send
 * override, which differ only in what the caller does with onChange.
 *
 * A null value means "whatever the server resolves", so clearing is a real
 * choice rather than an empty state.
 */
const ModelPicker: FunctionComponent<ModelPickerProps> = ({
  models,
  value,
  onChange,
  label,
  disabled = false,
}) => {
  if (!models.length) return null;

  return (
    <Select
      ariaLabel={label}
      placeholder={label}
      value={value ?? undefined}
      allowClear
      disabled={disabled}
      onChange={next => onChange((next as string) ?? null)}
      onClear={() => onChange(null)}
      options={models.map(model => ({
        value: model.alias,
        label: model.is_default ? t('%s (default)', model.alias) : model.alias,
      }))}
      css={{ minWidth: 160 }}
    />
  );
};

export default ModelPicker;
