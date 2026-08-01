import { Preset, VizType } from '@zobi.dev/core';
import BubbleChartPlugin from './Bubble';
import BulletChartPlugin from './Bullet';
import CompareChartPlugin from './Compare';
import TimePivotChartPlugin from './TimePivot';

export default class NVD3ChartPreset extends Preset {
  constructor() {
    super({
      name: 'NVD3 charts',
      plugins: [
        new BubbleChartPlugin().configure({ key: VizType.LegacyBubble }),
        new BulletChartPlugin().configure({ key: VizType.Bullet }),
        new CompareChartPlugin().configure({ key: VizType.Compare }),
        new TimePivotChartPlugin().configure({ key: VizType.TimePivot }),
      ],
    });
  }
}
