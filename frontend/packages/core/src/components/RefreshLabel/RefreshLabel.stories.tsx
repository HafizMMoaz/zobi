import RefreshLabel, { RefreshLabelProps } from '.';

export default {
  title: 'Components/RefreshLabel',
};

export const InteractiveRefreshLabel = (args: RefreshLabelProps) => (
  <RefreshLabel {...args} />
);

InteractiveRefreshLabel.args = {
  tooltipContent: 'Tooltip',
};

InteractiveRefreshLabel.argTypes = {
  onClick: { action: 'onClick' },
};
