import { isValidElement, ReactElement } from 'react';
import { sharedControls, sharedControlComponents } from '../shared-controls';
import {
  ControlType,
  ControlSetItem,
  ExpandedControlItem,
  ControlOverrides,
} from '../types';

export function expandControlType(controlType: ControlType) {
  if (
    typeof controlType === 'string' &&
    controlType in sharedControlComponents
  ) {
    return sharedControlComponents[
      controlType as keyof typeof sharedControlComponents
    ];
  }
  return controlType;
}

/**
 * Expand a shorthand control config item to full config in the format of
 *   {
 *     name: ...,
 *     config: {
 *        type: ...,
 *        ...
 *     }
 *   }
 */
export function expandControlConfig(
  control: ControlSetItem,
  controlOverrides: ControlOverrides = {},
): ExpandedControlItem {
  // one of the named shared controls
  if (typeof control === 'string' && control in sharedControls) {
    const name = control;
    return {
      name,
      config: {
        ...sharedControls[name],
        ...controlOverrides[name],
      },
    };
  }
  // JSX/React element or NULL
  if (!control || typeof control === 'string' || isValidElement(control)) {
    return control as ReactElement;
  }
  // already fully expanded control config, e.g.
  // {
  //   name: 'metric',
  //   config: {
  //     type: 'SelectControl' | SelectComponent
  //   }
  // }
  if ('name' in control && 'config' in control) {
    return {
      ...control,
      config: {
        ...control.config,
        type: expandControlType(control.config.type as ControlType),
      },
    };
  }
  // apply overrides with shared controls
  if ('override' in control && control.name in sharedControls) {
    const { name, override } = control;
    return {
      name,
      config: {
        ...sharedControls[name],
        ...override,
      },
    };
  }
  return null;
}
