import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { ContourOptionProps } from './types';
import ContourPopoverTrigger from './ContourPopoverTrigger';
import OptionWrapper from '../DndColumnSelectControl/OptionWrapper';

const StyledOptionWrapper = styled(OptionWrapper)`
  max-width: 100%;
  min-width: 100%;
`;

const StyledListItem = styled.li`
  display: flex;
  align-items: center;
`;

const ColorPatch = styled.div<{ formattedColor: string }>`
  background-color: ${({ formattedColor }) => formattedColor};
  height: ${({ theme }) => theme.sizeUnit}px;
  width: ${({ theme }) => theme.sizeUnit}px;
  margin: 0 ${({ theme }) => theme.sizeUnit}px;
`;

const ContourOption = ({
  contour,
  index,
  saveContour,
  onClose,
  onShift,
}: ContourOptionProps) => {
  const { lowerThreshold, upperThreshold, color, strokeWidth } = contour;

  const isIsoband = upperThreshold;

  const formattedColor = color
    ? `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
    : 'transparent';

  const formatIsoline = (threshold: number, width: number) =>
    `${t('Threshold')}: ${threshold}, ${t('color')}: ${formattedColor}, ${t(
      'stroke width',
    )}: ${width}`;

  const formatIsoband = (threshold: number[]) =>
    `${t('Threshold')}: [${threshold[0]}, ${
      threshold[1]
    }], color: ${formattedColor}`;

  const displayString = isIsoband
    ? formatIsoband([lowerThreshold || -1, upperThreshold])
    : formatIsoline(lowerThreshold || -1, strokeWidth);

  const overlay = (
    <div className="contour-tooltip-overlay">
      <StyledListItem>
        {t('Threshold: ')}
        {isIsoband
          ? `[${lowerThreshold}, ${upperThreshold}]`
          : `${lowerThreshold}`}
      </StyledListItem>
      <StyledListItem>
        {t('Color: ')}
        <ColorPatch formattedColor={formattedColor} /> {formattedColor}
      </StyledListItem>
      {!isIsoband && (
        <StyledListItem>{`${t(
          'Stroke Width:',
        )} ${strokeWidth}`}</StyledListItem>
      )}
    </div>
  );

  return (
    <ContourPopoverTrigger saveContour={saveContour} value={contour}>
      <StyledOptionWrapper
        index={index}
        label={displayString}
        type="ContourOption"
        withCaret
        clickClose={onClose}
        onShiftOptions={onShift}
        tooltipOverlay={overlay}
      />
    </ContourPopoverTrigger>
  );
};

export default ContourOption;
