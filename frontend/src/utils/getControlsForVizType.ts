
import memoizeOne from 'memoize-one';
import React from 'react';
import { isControlPanelSectionConfig } from '@zobi.dev/chart-controls';
import { getChartControlPanelRegistry, JsonObject } from '@zobi.dev/core';
import type { ControlMap } from 'src/components/AlteredSliceTag/types';
import { controls } from '../explore/controls';

const memoizedControls = memoizeOne(
  (vizType: string, controlPanel: JsonObject | undefined): ControlMap => {
    const controlsMap: ControlMap = {};
    if (!controlPanel) return controlsMap;

    const sections = controlPanel.controlPanelSections || [];
    (Array.isArray(sections) ? sections : [])
      .filter(isControlPanelSectionConfig)
      .forEach(section => {
        if (section.controlSetRows && Array.isArray(section.controlSetRows)) {
          section.controlSetRows.forEach(row => {
            if (Array.isArray(row)) {
              row.forEach(control => {
                if (!control) return;
                if (typeof control === 'string') {
                  // For now, we have to look in controls.jsx to get the config for some controls.
                  // Once everything is migrated out, delete this if statement.
                  const controlConfig = (controls as any)[control];
                  if (controlConfig) {
                    controlsMap[control] = controlConfig;
                  }
                } else if (
                  typeof control === 'object' &&
                  control &&
                  'name' in control &&
                  'config' in control
                ) {
                  // condition needed because there are elements, e.g. <hr /> in some control configs (I'm looking at you, FilterBox!)
                  const controlObj = control as {
                    name: string;
                    config: JsonObject;
                  };
                  controlsMap[controlObj.name] = controlObj.config;
                } else if (React.isValidElement(control)) {
                  const { name } = control.props as { name: string };
                  if (name) {
                    const ComponentType = control.type as React.ComponentType;
                    controlsMap[name] = {
                      type:
                        ComponentType.displayName ||
                        ComponentType.name ||
                        'CustomControl',
                    };
                  }
                }
              });
            }
          });
        }
      });
    return controlsMap;
  },
);

const getControlsForVizType = (vizType: string): ControlMap => {
  const controlPanel = getChartControlPanelRegistry().get(vizType);
  return memoizedControls(vizType, controlPanel);
};

export default getControlsForVizType;
