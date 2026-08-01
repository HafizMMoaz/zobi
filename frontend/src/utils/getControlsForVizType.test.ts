
import { getChartControlPanelRegistry, JsonObject } from '@zobi-ui/core';
import getControlsForVizType from 'src/utils/getControlsForVizType';

const fakePluginControls: JsonObject = {
  controlPanelSections: [
    {
      label: 'Fake Control Panel Sections',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'y_axis_bounds',
            config: {
              type: 'BoundsControl',
              label: 'Value bounds',
              default: [null, null],
              description: 'Value bounds for the y axis',
            },
          },
        ],
        [
          {
            name: 'adhoc_filters',
            config: {
              type: 'AdhocFilterControl',
              label: 'Fake Filters',
              default: null,
            },
          },
        ],
      ],
    },
    {
      label: 'Fake Control Panel Sections 2',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'column_collection',
            config: {
              type: 'CollectionControl',
              label: 'Fake Collection Control',
            },
          },
        ],
      ],
    },
  ],
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('getControlsForVizType', () => {
  beforeEach(() => {
    getChartControlPanelRegistry().registerValue(
      'chart_controls_inventory_fake',
      fakePluginControls,
    );
  });

  test('returns a map of the controls', () => {
    expect(
      JSON.stringify(getControlsForVizType('chart_controls_inventory_fake')),
    ).toEqual(
      JSON.stringify({
        y_axis_bounds: {
          type: 'BoundsControl',
          label: 'Value bounds',
          default: [null, null],
          description: 'Value bounds for the y axis',
        },
        adhoc_filters: {
          type: 'AdhocFilterControl',
          label: 'Fake Filters',
          default: null,
        },
        column_collection: {
          type: 'CollectionControl',
          label: 'Fake Collection Control',
        },
      }),
    );
  });
});
