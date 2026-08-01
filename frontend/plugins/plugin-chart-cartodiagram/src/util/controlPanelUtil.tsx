import { t } from '@zobi/core/translation';
import { ControlPanelConfig } from '@zobi-ui/chart-controls';

/**
 * Get the layer configuration object from the control panel.
 *
 * @param controlPanel The control panel
 * @returns The layer configuration object or undefined if not found
 */

export const getLayerConfig = (controlPanel: ControlPanelConfig) => {
  let layerConfig: any;
  controlPanel.controlPanelSections.forEach(section => {
    if (!section) {
      return;
    }
    const { controlSetRows } = section;
    controlSetRows.forEach((row: any[]) => {
      const configObject = row[0] as any;
      if (configObject && configObject.name === 'layer_configs') {
        layerConfig = configObject;
      }
    });
  });

  return layerConfig;
};

/**
 * Mutates response of chart request into select options.
 *
 * If a currently selected value is not included in the response,
 * it will be added explicitly, in order to prevent antd from creating
 * a non-user-friendly select option.
 *
 * @param response Response json from resolved http request.
 * @param value The currently selected value of the select input.
 * @returns The list of options for the select input.
 */
export const selectedChartMutator = (
  response: Record<string, any>,
  value: any,
) => {
  if (!response?.result) {
    if (value && typeof value === 'string') {
      return [
        {
          label: JSON.parse(value).slice_name,
          value,
        },
      ];
    }
    return [];
  }

  const data: any[] = [];
  if (value && typeof value === 'string') {
    const parsedValue = JSON.parse(value);
    let itemFound = false;
    response.result.forEach((config: any) => {
      const configString = JSON.stringify(config);
      const sameId = config.id === parsedValue.id;
      const isUpdated = configString !== value;
      const label = config.slice_name;

      if (sameId) {
        itemFound = true;
      }
      if (!sameId || !isUpdated) {
        data.push({
          value: configString,
          label,
        });
      } else {
        data.push({
          value: configString,
          label: (
            <span>
              <i>({t('updated')}) </i>
              {label}
            </span>
          ),
        });
        data.push({
          value,
          label,
        });
      }
    });

    if (!itemFound) {
      data.push({
        value,
        label: parsedValue.slice_name,
      });
    }
  } else {
    response.result.forEach((config: any) => {
      const configString = JSON.stringify(config);
      const label = config.slice_name;

      data.push({
        value: configString,
        label,
      });
    });
  }

  return data;
};
