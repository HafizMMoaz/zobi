import { useState, useEffect } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import DndSelectLabel from 'src/explore/components/controls/DndColumnSelectControl/DndSelectLabel';
import ColorBreakpointOption from './ColorBreakpointOption';
import { ColorBreakpointType, ColorBreakpointsControlProps } from './types';
import ColorBreakpointPopoverTrigger from './ColorBreakpointPopoverTrigger';

const DEFAULT_COLOR_BREAKPOINTS: ColorBreakpointType[] = [];

const NewColorBreakpointFormatPlaceholder = styled('div')`
  position: relative;
  width: calc(100% - ${({ theme }) => theme.sizeUnit}px);
  bottom: ${({ theme }) => theme.sizeUnit * 4}px;
  left: 0;
`;

const ColorBreakpointsControl = ({
  onChange,
  ...props
}: ColorBreakpointsControlProps) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [colorBreakpoints, setColorBreakpoints] = useState<
    ColorBreakpointType[]
  >(props?.value ? props?.value : DEFAULT_COLOR_BREAKPOINTS);

  useEffect(() => {
    onChange?.(colorBreakpoints);
  }, [colorBreakpoints, onChange]);

  const togglePopover = (visible: boolean) => {
    setPopoverVisible(visible);
  };

  const handleClickGhostButton = () => {
    togglePopover(true);
  };

  const saveColorBreakpoint = (breakpoint: ColorBreakpointType) => {
    setColorBreakpoints([
      ...colorBreakpoints,
      {
        ...breakpoint,
        id: colorBreakpoints.length,
      },
    ]);
    togglePopover(false);
  };

  const removeColorBreakpoint = (index: number) => {
    const newBreakpoints = [...colorBreakpoints];
    newBreakpoints.splice(index, 1);
    setColorBreakpoints(newBreakpoints);
  };

  const editColorBreakpoint = (
    breakpoint: ColorBreakpointType,
    index: number,
  ) => {
    const newBreakpoints = [...colorBreakpoints];
    newBreakpoints[index] = {
      ...breakpoint,
      id: index,
    };
    setColorBreakpoints(newBreakpoints);
  };

  const valuesRenderer = () =>
    colorBreakpoints.map((breakpoint, index) => (
      <ColorBreakpointOption
        key={index}
        saveColorBreakpoint={(newBreakpoint: ColorBreakpointType) =>
          editColorBreakpoint(newBreakpoint, index)
        }
        breakpoint={breakpoint}
        colorBreakpoints={colorBreakpoints}
        index={index}
        onClose={removeColorBreakpoint}
        onShift={() => {}}
      />
    ));

  const ghostButtonText = t('Click to add new breakpoint');

  return (
    <>
      <DndSelectLabel
        onDrop={() => {}}
        canDrop={() => false}
        valuesRenderer={valuesRenderer}
        accept={[]}
        ghostButtonText={ghostButtonText}
        onClickGhostButton={handleClickGhostButton}
        {...props}
      />
      <ColorBreakpointPopoverTrigger
        saveColorBreakpoint={saveColorBreakpoint}
        colorBreakpoints={colorBreakpoints}
        isControlled
        visible={popoverVisible}
        toggleVisibility={setPopoverVisible}
      >
        <NewColorBreakpointFormatPlaceholder />
      </ColorBreakpointPopoverTrigger>
    </>
  );
};

export default ColorBreakpointsControl;
