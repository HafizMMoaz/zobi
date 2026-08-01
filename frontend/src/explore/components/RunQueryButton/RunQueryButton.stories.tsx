import { RunQueryButton, RunQueryButtonProps } from '.';

export default {
  title: 'Components/RunQueryButton',
  component: RunQueryButton,
};

export const InteractiveRunQueryButtonProps = (args: RunQueryButtonProps) => (
  <RunQueryButton {...args} />
);

InteractiveRunQueryButtonProps.args = {
  canStopQuery: true,
  loading: false,
  errorMessage: null,
  isNewChart: false,
  chartIsStale: true,
};

InteractiveRunQueryButtonProps.argTypes = {
  onQuery: { action: 'onQuery' },
  onStop: { action: 'onStop' },
};
