
import { css, ZobiTheme } from '@zobi/core/theme';
import { useRef, useState } from 'react';
import { Tooltip } from '@zobi-ui/core/components';

type ColorSchemeLabelProps = {
  colors: string[];
  id: string;
  label: string;
};

export default function ColorSchemeLabel(props: ColorSchemeLabelProps) {
  const { id, label, colors } = props;
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const labelNameRef = useRef<HTMLElement>(null);
  const labelsColorRef = useRef<HTMLElement>(null);
  const handleShowTooltip = () => {
    const labelNameElement = labelNameRef.current;
    const labelsColorElement = labelsColorRef.current;
    if (
      labelNameElement &&
      labelsColorElement &&
      (labelNameElement.scrollWidth > labelNameElement.offsetWidth ||
        labelNameElement.scrollHeight > labelNameElement.offsetHeight ||
        labelsColorElement.scrollWidth > labelsColorElement.offsetWidth ||
        labelsColorElement.scrollHeight > labelsColorElement.offsetHeight)
    ) {
      setShowTooltip(true);
    }
  };
  const handleHideTooltip = () => {
    setShowTooltip(false);
  };

  const colorsList = () =>
    colors.map((color: string, i: number) => (
      <span
        data-test="color"
        key={`${id}-${i}`}
        css={(theme: { sizeUnit: number }) => css`
          padding-left: ${theme.sizeUnit / 2}px;
          :before {
            content: '';
            display: inline-block;
            background-color: ${color};
            border: 1px solid ${color === 'white' ? 'black' : color};
            width: 9px;
            height: 10px;
          }
        `}
      />
    ));

  const tooltipContent = () => (
    <>
      <span>{label}</span>
      <div>{colorsList()}</div>
    </>
  );

  return (
    <Tooltip
      data-testid="tooltip"
      overlayClassName="color-scheme-tooltip"
      title={tooltipContent}
      key={id}
      open={showTooltip}
    >
      <span
        className="color-scheme-option"
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        css={css`
          display: flex;
          align-items: center;
          justify-content: flex-start;
        `}
        data-test={id}
      >
        <span
          className="color-scheme-label"
          ref={labelNameRef}
          css={(theme: ZobiTheme) => css`
            min-width: 125px;
            padding-right: ${theme.sizeUnit * 2}px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          `}
        >
          {label}
        </span>
        <span
          ref={labelsColorRef}
          css={(theme: ZobiTheme) => css`
            flex: 100%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            padding-right: ${theme.sizeUnit}px;
          `}
        >
          {colorsList()}
        </span>
      </span>
    </Tooltip>
  );
}
