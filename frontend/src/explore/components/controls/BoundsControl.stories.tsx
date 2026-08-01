import BoundsControl, { BoundsControlProps } from './BoundsControl';

export default {
  title: 'Components/BoundsControl',
  component: BoundsControl,
};

export const InteractiveBoundsControl = (
  args: BoundsControlProps & { initialMin: number; initialMax: number },
) => {
  const { initialMin, initialMax, ...props } = args;

  return (
    <>
      <BoundsControl {...props} value={[initialMin, initialMax]} />
    </>
  );
};

InteractiveBoundsControl.args = {
  initialMin: 0,
  initialMax: 50,
};

InteractiveBoundsControl.argTypes = {
  onChange: { action: 'onChange' },
};
