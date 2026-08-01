import ControlHeader, { ControlHeaderProps } from './ControlHeader';

export default {
  title: 'Components/ControlHeader',
  component: ControlHeader,
};

const options: {
  [key: string]: ControlHeaderProps;
} = {
  label: {
    label: 'Control label',
  },
  warning: {
    label: 'Control warning',
    warning: 'Example of warning message',
  },
  error: {
    label: 'Control error',
    validationErrors: ['Something is wrong'],
  },
};

export const ControlHeaderGallery = () => (
  <>
    {Object.entries(options).map(([name, props]) => (
      <>
        <h4>{name}</h4>
        <ControlHeader {...props} />
      </>
    ))}
  </>
);

export const InteractiveControlHeader = (props: ControlHeaderProps) => (
  <ControlHeader {...props} />
);

InteractiveControlHeader.args = {
  label: 'example label',
  description: 'example description',
  warning: 'example warning',
  renderTrigger: false,
  hovered: false,
};

InteractiveControlHeader.argTypes = {
  tooltipOnClick: { action: 'tooltipOnClick' },
  onClick: { action: 'onClick' },
};
