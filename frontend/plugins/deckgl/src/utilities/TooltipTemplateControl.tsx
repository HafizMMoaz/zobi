
import { useCallback } from 'react';
import { debounce } from 'lodash';
import { t } from '@zobi.dev/extension-api/translation';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { InfoTooltip, Constants } from '@zobi.dev/core/components';
import { ControlHeader } from '@zobi.dev/chart-controls';
import { TooltipTemplateEditor } from './TooltipTemplateEditor';

interface TooltipTemplateControlProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  name: string;
  height?: number;
}

const debounceFunc = debounce(
  (func: (val: string) => void, source: string) => func(source),
  Constants.SLOW_DEBOUNCE,
);

export function TooltipTemplateControl({
  value,
  onChange,
  label,
  name,
}: TooltipTemplateControlProps) {
  const theme = useTheme();

  const handleTemplateChange = useCallback(
    (newValue: string) => {
      debounceFunc(onChange, newValue || '');
    },
    [onChange],
  );

  const tooltipContent = t(
    'Use Handlebars syntax to create custom tooltips. Available variables are based on your tooltip contents selection above.',
  );

  return (
    <div>
      <ControlHeader
        name={name}
        label={
          <>
            {label || t('Customize tooltips template')}
            <InfoTooltip
              iconStyle={{ marginLeft: theme.sizeUnit }}
              tooltip={tooltipContent}
            />
          </>
        }
      />
      <TooltipTemplateEditor
        value={value}
        onChange={handleTemplateChange}
        name={name}
      />
    </div>
  );
}

export default TooltipTemplateControl;
