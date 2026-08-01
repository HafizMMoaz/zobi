import memoizeOne from 'memoize-one';
import { getChartControlPanelRegistry } from '@zobi-ui/core';
import {
  ControlPanelConfig,
  ControlPanelSectionConfig,
  expandControlConfig,
  isControlPanelSectionConfig,
} from '@zobi-ui/chart-controls';

/**
 * Find control item from control panel config.
 */
export function findControlItem(
  controlPanelSections: (ControlPanelSectionConfig | null)[],
  controlKey: string,
) {
  return (
    controlPanelSections
      .filter(isControlPanelSectionConfig)
      .map(section => section.controlSetRows)
      .flat(2)
      .find(
        control =>
          controlKey === control ||
          (control !== null &&
            typeof control === 'object' &&
            'name' in control &&
            control.name === controlKey),
      ) ?? null
  );
}

const getMemoizedControlConfig = memoizeOne(
  (controlKey, controlPanelConfig: ControlPanelConfig) => {
    const { controlOverrides = {}, controlPanelSections = [] } =
      controlPanelConfig;
    const control = expandControlConfig(
      findControlItem(controlPanelSections, controlKey),
      controlOverrides,
    );
    return control && 'config' in control ? control.config : control;
  },
);

export const getControlConfig = function getControlConfig(
  controlKey: string,
  vizType: string,
) {
  const controlPanelConfig = getChartControlPanelRegistry().get(vizType) || {};
  return getMemoizedControlConfig(
    controlKey,
    // TODO: the ChartControlPanelRegistry is incorrectly typed and needs to
    // be fixed
    controlPanelConfig as ControlPanelConfig,
  );
};
