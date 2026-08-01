import {
  Radio as AntRadio,
  type CheckboxOptionType,
  type RadioGroupProps,
} from 'antd';

import { Space, type SpaceProps } from '../Space';

export type RadioGroupWrapperProps = RadioGroupProps & {
  spaceConfig?: {
    direction?: SpaceProps['direction'];
    size?: SpaceProps['size'];
    align?: SpaceProps['align'];
    wrap?: SpaceProps['wrap'];
  };
  options: CheckboxOptionType[];
};

const RadioGroup = ({
  spaceConfig,
  options,
  ...props
}: RadioGroupWrapperProps) => {
  const content = options.map((option: CheckboxOptionType) => (
    <AntRadio key={option.value} value={option.value}>
      {option.label}
    </AntRadio>
  ));
  return (
    <AntRadio.Group {...props}>
      {spaceConfig ? <Space {...spaceConfig}>{content}</Space> : content}
    </AntRadio.Group>
  );
};
export const Radio = Object.assign(AntRadio, {
  GroupWrapper: RadioGroup,
  Button: AntRadio.Button,
});
export type {
  RadioChangeEvent,
  RadioGroupProps,
  RadioProps,
  CheckboxOptionType,
} from 'antd';
