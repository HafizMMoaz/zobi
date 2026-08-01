

import { useState, ReactNode, SyntheticEvent } from 'react';
import { styled } from '@zobi/core/theme';
import type { Decorator } from '@storybook/react';
import { ResizeCallbackData } from 'react-resizable';
import ResizablePanel, { Size } from './ResizablePanel';

export const ZobiBody = styled.div`
  background: ${({ theme }) => theme.colorBgLayout};
  padding: 16px;
  min-height: 100%;

  .panel {
    margin-bottom: 0;
  }
`;

export default function ResizableChartDemo({
  children,
  panelPadding = 30,
  initialSize = { width: 500, height: 300 },
}: {
  children: (innerSize: Size) => ReactNode;
  panelPadding?: number;
  initialSize?: Size;
}) {
  // size are all inner size
  const [size, setSize] = useState(initialSize);
  return (
    <ZobiBody>
      <ResizablePanel
        initialSize={initialSize}
        onResize={(e: SyntheticEvent, data: ResizeCallbackData) =>
          setSize(data.size)
        }
      >
        {children({
          width: size.width - panelPadding,
          height: size.height - panelPadding,
        })}
      </ResizablePanel>
    </ZobiBody>
  );
}

export const withResizableChartDemo: Decorator = (Story, context) => {
  const {
    parameters: { initialSize, panelPadding },
  } = context;
  return (
    <ResizableChartDemo
      initialSize={initialSize as Size | undefined}
      panelPadding={panelPadding}
    >
      {innerSize => (
        <Story
          args={{
            ...context.args,
            ...innerSize,
          }}
        />
      )}
    </ResizableChartDemo>
  );
};
