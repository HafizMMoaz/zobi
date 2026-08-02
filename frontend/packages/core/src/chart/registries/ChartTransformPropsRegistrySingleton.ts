import { Registry, makeSingleton, OverwritePolicy } from '../..';
import { TransformProps } from '../types/TransformFunction';

class ChartTransformPropsRegistry extends Registry<TransformProps<any>> {
  constructor() {
    super({
      name: 'ChartTransformProps',
      overwritePolicy: OverwritePolicy.Warn,
    });
  }
}

const getInstance = makeSingleton(ChartTransformPropsRegistry);

export default getInstance;
