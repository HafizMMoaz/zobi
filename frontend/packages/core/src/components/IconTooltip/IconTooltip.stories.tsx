import { Icons } from '@zobi.dev/core/components/Icons';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { IconTooltip } from '.';
import type { IconTooltipProps } from './types';

export default {
  title: 'Components/IconTooltip',
};

const PLACEMENTS = [
  'bottom',
  'bottomLeft',
  'bottomRight',
  'left',
  'leftBottom',
  'leftTop',
  'right',
  'rightBottom',
  'rightTop',
  'top',
  'topLeft',
  'topRight',
];

export const InteractiveIconTooltip = (args: IconTooltipProps) => {
  const theme = useTheme();
  return (
    <div
      css={css`
        margin: ${theme.sizeUnit * 10}px ${theme.sizeUnit * 17.5}px;
      `}
    >
      <IconTooltip {...args}>
        <Icons.InfoCircleOutlined />
      </IconTooltip>
    </div>
  );
};

InteractiveIconTooltip.args = {
  tooltip: 'Tooltip',
};

InteractiveIconTooltip.argTypes = {
  placement: {
    defaultValue: 'top',
    control: { type: 'select' },
    options: PLACEMENTS,
    description: 'Position of the tooltip relative to the icon.',
  },
  tooltip: {
    control: { type: 'text' },
    description: 'Text content to display in the tooltip.',
  },
};

InteractiveIconTooltip.parameters = {
  docs: {
    description: {
      story:
        'A tooltip wrapper for icons. Pass an icon component as children and specify tooltip text.',
    },
    sampleChildren: [
      { component: 'Icons.InfoCircleOutlined', props: { iconSize: 'l' } },
    ],
    liveExample: `function Demo() {
  return (
    <IconTooltip tooltip="Helpful information">
      <Icons.InfoCircleOutlined iconSize="l" />
    </IconTooltip>
  );
}`,
  },
};
