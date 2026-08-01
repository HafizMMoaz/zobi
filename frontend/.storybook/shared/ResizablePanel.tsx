

import { ReactNode, SyntheticEvent } from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { styled } from '@zobi/core/theme';

import 'react-resizable/css/styles.css';

const StyledResizableBox = styled(ResizableBox)`
  &.panel {
    overflow: hidden;
    background: ${({ theme }) => theme.colorBgContainer};
    border: 1px solid ${({ theme }) => theme.colorBorder};
    border-radius: ${({ theme }) => theme.borderRadius}px;
  }

  .panel-body {
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
`;

export type Size = ResizeCallbackData['size'];

export default function ResizablePanel({
  children,
  heading,
  initialSize = { width: 500, height: 300 },
  minConstraints = [100, 100] as [number, number],
  onResize,
}: {
  children?: ReactNode;
  heading?: ReactNode;
  initialSize?: Size;
  minConstraints?: [number, number];
  onResize?: (e: SyntheticEvent, data: ResizeCallbackData) => void;
}) {
  const { width, height } = initialSize;
  return (
    <StyledResizableBox
      className="panel"
      width={width}
      height={height}
      axis="both"
      minConstraints={minConstraints}
      maxConstraints={[Infinity, Infinity]}
      handleSize={[20, 20]}
      lockAspectRatio={false}
      resizeHandles={['se']}
      transformScale={1}
      onResize={onResize}
    >
      <>
        {heading ? <div className="panel-heading">{heading}</div> : null}
        <div className="panel-body">{children}</div>
      </>
    </StyledResizableBox>
  );
}
