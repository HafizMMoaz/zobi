

import { Registry, makeSingleton, OverwritePolicy } from '../..';
import { ChartType } from '../models/ChartPlugin';

class ChartComponentRegistry extends Registry<ChartType> {
  constructor() {
    super({ name: 'ChartComponent', overwritePolicy: OverwritePolicy.Warn });
  }
}

const getInstance = makeSingleton(ChartComponentRegistry);

export default getInstance;
