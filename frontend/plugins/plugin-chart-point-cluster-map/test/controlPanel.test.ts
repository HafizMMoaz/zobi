import type {
  ControlPanelConfig,
  CustomControlItem,
} from '@zobi-ui/chart-controls';
import controlPanel from '../src/controlPanel';

type ControlConfig = Required<CustomControlItem['config']>;

function isCustomControlItem(
  controlItem: unknown,
): controlItem is CustomControlItem & { config: ControlConfig } {
  return (
    typeof controlItem === 'object' &&
    controlItem !== null &&
    'name' in controlItem &&
    'config' in controlItem
  );
}

function getControl(
  panel: ControlPanelConfig,
  controlName: string,
): CustomControlItem & { config: ControlConfig } {
  const item = (panel.controlPanelSections || [])
    .flatMap(section => section?.controlSetRows || [])
    .flat()
    .find(
      controlItem =>
        isCustomControlItem(controlItem) && controlItem.name === controlName,
    );

  if (!isCustomControlItem(item)) {
    throw new Error(`Control "${controlName}" not found`);
  }

  return item;
}

test('viewport controls default to empty values and rerender without query refresh', () => {
  const longitudeControl = getControl(controlPanel, 'viewport_longitude');
  const latitudeControl = getControl(controlPanel, 'viewport_latitude');
  const zoomControl = getControl(controlPanel, 'viewport_zoom');

  expect(longitudeControl.config.default).toBe('');
  expect(latitudeControl.config.default).toBe('');
  expect(zoomControl.config.default).toBe('');

  expect(longitudeControl.config.renderTrigger).toBe(true);
  expect(latitudeControl.config.renderTrigger).toBe(true);
  expect(zoomControl.config.renderTrigger).toBe(true);

  expect(longitudeControl.config.dontRefreshOnChange).toBe(true);
  expect(latitudeControl.config.dontRefreshOnChange).toBe(true);
  expect(zoomControl.config.dontRefreshOnChange).toBe(true);
});

test('opacity control rerenders immediately when changed', () => {
  const opacityControl = getControl(controlPanel, 'global_opacity');

  expect(opacityControl.config.default).toBe(1);
  expect(opacityControl.config.renderTrigger).toBe(true);
  expect(opacityControl.config.isFloat).toBe(true);
});
