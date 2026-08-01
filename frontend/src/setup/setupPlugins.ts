import { getChartControlPanelRegistry } from '@zobi.dev/core';
import { convertAgGridStateToOwnState } from '@zobi.dev/ag-grid-table';
import MainPreset from '../visualizations/presets/MainPreset';
import setupPluginsExtra from './setupPluginsExtra';
import { registerChartStateConverter } from '../dashboard/util/chartStateConverter';

import Separator from '../explore/controlPanels/Separator';

export default function setupPlugins() {
  new MainPreset().register();

  // TODO: Remove these shims once the control panel configs are moved into the plugin package.
  getChartControlPanelRegistry().registerValue('separator', Separator);

  // Register chart state converters for stateful charts
  registerChartStateConverter('ag-grid-table', convertAgGridStateToOwnState);

  setupPluginsExtra();
}
