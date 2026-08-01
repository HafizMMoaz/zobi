import { AlteredSliceTag } from '.';
import { defaultProps, expectedDiffs } from './AlteredSliceTagMocks';

export default {
  title: 'Components/AlteredSliceTag',
};

export const InteractiveSliceTag = (args: any) => <AlteredSliceTag {...args} />;

InteractiveSliceTag.args = {
  origFormData: defaultProps.origFormData,
  diffs: expectedDiffs,
};
