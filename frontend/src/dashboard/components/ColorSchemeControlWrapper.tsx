/* eslint-env browser */
import { t } from '@zobi.dev/extension-api/translation';
import { getCategoricalSchemeRegistry } from '@zobi.dev/core';
import { useEffect, useState } from 'react';
import ColorSchemeControl from 'src/explore/components/controls/ColorSchemeControl';

interface ColorSchemeControlWrapperProps {
  colorScheme?: string;
  hasCustomLabelsColor: boolean;
  hovered?: boolean;
  onChange: () => void;
}

const ColorSchemeControlWrapper = ({
  colorScheme,
  hasCustomLabelsColor = false,
  hovered = false,
  onChange = () => {},
}: ColorSchemeControlWrapperProps) => {
  const [choices, setChoices] = useState<string[][]>([]);
  const [schemes, setSchemes] = useState({});

  useEffect(() => {
    // Registry initialization
    const categoricalSchemeRegistry = getCategoricalSchemeRegistry();
    setChoices(categoricalSchemeRegistry.keys().map(s => [s, s]));
    setSchemes(categoricalSchemeRegistry.getMap());
  }, []); // Empty dependency array ensures this runs only once

  return (
    <ColorSchemeControl
      description={t(
        "Any color palette selected here will override the colors applied to this dashboard's individual charts",
      )}
      name="color_scheme"
      onChange={onChange}
      value={colorScheme ?? ''}
      choices={choices}
      clearable
      hovered={hovered}
      schemes={schemes}
      hasCustomLabelsColor={hasCustomLabelsColor}
    />
  );
};

export default ColorSchemeControlWrapper;
