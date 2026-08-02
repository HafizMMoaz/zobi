import { memo, ReactNode } from 'react';

import { isDefined } from '../utils';

function checkNumber(input: unknown): input is number {
  return isDefined(input) && typeof input === 'number';
}

type Props = {
  contentWidth?: number;
  contentHeight?: number;
  height: number;
  renderContent?: ({
    height,
    width,
  }: {
    height: number;
    width: number;
  }) => ReactNode;
  width: number;
};

function ChartFrame({
  contentWidth,
  contentHeight,
  width,
  height,
  renderContent = () => null,
}: Props) {
  const overflowX = checkNumber(contentWidth) && contentWidth > width;
  const overflowY = checkNumber(contentHeight) && contentHeight > height;

  if (overflowX || overflowY) {
    return (
      <div
        style={{
          height,
          overflowX: overflowX ? 'auto' : 'hidden',
          overflowY: overflowY ? 'auto' : 'hidden',
          width,
        }}
      >
        {renderContent({
          height: Math.max(contentHeight ?? 0, height),
          width: Math.max(contentWidth ?? 0, width),
        })}
      </div>
    );
  }

  return <>{renderContent({ height, width })}</>;
}

export default memo(ChartFrame);
