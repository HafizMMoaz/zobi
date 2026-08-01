import { getCategoricalSchemeRegistry } from '@zobi.dev/core';
import InternalColorSchemeControl from './ColorSchemeControl/index';
import { ColorSchemes } from './ColorSchemeControl/index';
// NOTE: We copied the Explore ColorSchemeControl into this plugin to avoid
// pulling the entire frontend src tree into this package’s tsconfig (importing
// from src/ was dragging in fixtures, tests, and other plugins). Keep this copy
// in sync with upstream changes, and consider moving it into a shared package
// once the control-panel refactor settles so all consumers can reuse it.
import { ControlComponentProps } from '@zobi.dev/chart-controls';

type ColorSchemeControlWrapperProps = ControlComponentProps<string> & {
  clearable?: boolean;
};

export default function ColorSchemeControlWrapper({
  name = 'color_scheme',
  value,
  onChange,
  clearable = true,
  label,
  description,
  ...rest
}: ColorSchemeControlWrapperProps) {
  const categoricalSchemeRegistry = getCategoricalSchemeRegistry();
  const choices = categoricalSchemeRegistry.keys().map(s => [s, s]);
  const schemes = categoricalSchemeRegistry.getMap() as ColorSchemes;

  return (
    <InternalColorSchemeControl
      name={name}
      value={value ?? ''}
      onChange={onChange}
      clearable={clearable}
      choices={choices}
      schemes={schemes}
      hasCustomLabelsColor={false}
      label={typeof label === 'string' ? label : undefined}
      description={typeof description === 'string' ? description : undefined}
      {...rest}
    />
  );
}

ColorSchemeControlWrapper.displayName = 'ColorSchemeControlWrapper';
