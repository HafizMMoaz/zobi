

import { Registry, makeSingleton, OverwritePolicy } from '../..';
import ChartMetadata from '../models/ChartMetadata';

class ChartMetadataRegistry extends Registry<ChartMetadata, ChartMetadata> {
  constructor() {
    super({ name: 'ChartMetadata', overwritePolicy: OverwritePolicy.Warn });
  }
}

const getInstance = makeSingleton(ChartMetadataRegistry);

export default getInstance;
