import WarningIconWithTooltip, { WarningIconWithTooltipProps } from '.';

export default {
  title: 'Components/WarningIconWithTooltip',
  component: WarningIconWithTooltip,
};

export const InteractiveWarningIcon = (args: WarningIconWithTooltipProps) => (
  <div css={{ margin: 40 }}>
    <WarningIconWithTooltip {...args} />
  </div>
);

InteractiveWarningIcon.args = {
  warningMarkdown: 'Markdown example',
  size: 20,
};
