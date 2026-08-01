import { InfoTooltip, InfoTooltipProps } from '.';

export default {
  title: 'Components/InfoTooltip',
  component: InfoTooltip,
};

export const InteractiveInfoTooltip = (props: InfoTooltipProps) => {
  const styles = {
    padding: '100px 0 0 200px',
  };

  return (
    <div style={styles}>
      <InfoTooltip {...props} />
    </div>
  );
};

InteractiveInfoTooltip.args = {
  tooltip: 'This is the text that will display!',
};

InteractiveInfoTooltip.argTypes = {
  placement: {
    defaultValue: 'top',
    control: {
      type: 'select',
    },
    options: [
      'bottom',
      'left',
      'right',
      'top',
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
      'leftTop',
      'leftBottom',
      'rightTop',
      'rightBottom',
    ],
  },
  trigger: {
    defaultValue: 'hover',
    control: {
      type: 'select',
    },
    options: ['hover', 'click'],
  },
};
