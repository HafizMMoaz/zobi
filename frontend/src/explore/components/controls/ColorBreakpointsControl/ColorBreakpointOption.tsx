
import { styled } from '@zobi/core/theme';
import { ColorBreakpointOptionProps } from './types';
import ColorBreakpointPopoverTrigger from './ColorBreakpointPopoverTrigger';
import { DragContainer } from '../OptionControls';
import Option from '../DndColumnSelectControl/Option';

const BreakpointColorPreview = styled.div`
  width: ${({ theme }) => theme.sizeUnit * 3}px;
  height: ${({ theme }) => theme.sizeUnit * 3}px;
  border-radius: ${({ theme }) => theme.sizeUnit / 2}px;
  background: ${(props: { color: string }) => props.color};
  margin-right: ${({ theme }) => theme.sizeUnit}px;
`;

const ColorBreakpointOption = ({
  breakpoint,
  colorBreakpoints,
  index,
  saveColorBreakpoint,
  onClose,
}: ColorBreakpointOptionProps) => {
  const { color, minValue, maxValue } = breakpoint;

  const formattedColor = color
    ? `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
    : '';

  return (
    <ColorBreakpointPopoverTrigger
      saveColorBreakpoint={saveColorBreakpoint}
      value={breakpoint}
      colorBreakpoints={colorBreakpoints}
    >
      <DragContainer data-test="color-breakpoint-trigger">
        <Option index={index} clickClose={onClose} canDelete withCaret>
          <BreakpointColorPreview
            color={formattedColor}
            data-test="color-preview"
          />
          {`${minValue} - ${maxValue}`}
        </Option>
      </DragContainer>
    </ColorBreakpointPopoverTrigger>
  );
};

export default ColorBreakpointOption;
