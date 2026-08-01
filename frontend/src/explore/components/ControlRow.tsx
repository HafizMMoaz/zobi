import { useCallback, ReactElement } from 'react';

const NUM_COLUMNS = 12;

type Control = ReactElement | null;

export default function ControlRow({ controls }: { controls: Control[] }) {
  const isHiddenControl = useCallback((control: Control) => {
    const props =
      control && 'shouldStash' in control.props
        ? control.props.children.props
        : control?.props;
    return props?.type === 'HiddenControl' || props?.isVisible === false;
  }, []);
  // Invisible control should not be counted
  // in the columns number
  const countableControls = controls.filter(
    control => !isHiddenControl(control),
  );
  const colSize = countableControls.length
    ? NUM_COLUMNS / countableControls.length
    : NUM_COLUMNS;
  return (
    <div className="row">
      {controls.map((control, i) => (
        <div
          data-test="control-item"
          className={`col-lg-${colSize} col-xs-12`}
          style={{
            display: isHiddenControl(control) ? 'none' : 'block',
          }}
          key={i}
        >
          {control}
        </div>
      ))}
    </div>
  );
}
