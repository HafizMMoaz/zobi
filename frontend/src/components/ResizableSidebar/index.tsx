import { FC, ReactNode } from 'react';
import { Resizable } from 're-resizable';
import { styled } from '@zobi.dev/extension-api/theme';
import useStoredSidebarWidth from './useStoredSidebarWidth';

const ResizableWrapper = styled.div`
  position: absolute;
  height: 100%;

  :hover .sidebar-resizer::after {
    background-color: ${({ theme }) => theme.colorPrimary};
  }

  .sidebar-resizer {
    // @z-index-above-sticky-header (100) + 1 = 101
    z-index: 101;
  }

  .sidebar-resizer::after {
    display: block;
    content: '';
    width: 1px;
    height: 100%;
    margin: 0 auto;
  }
`;

type Props = {
  id: string;
  initialWidth: number;
  enable: boolean;
  minWidth?: number;
  maxWidth?: number;
  children: (width: number) => ReactNode;
};

const ResizableSidebar: FC<Props> = ({
  id,
  initialWidth,
  minWidth,
  maxWidth,
  enable,
  children,
}) => {
  const [width, setWidth] = useStoredSidebarWidth(id, initialWidth);

  return (
    <>
      <ResizableWrapper>
        <Resizable
          enable={{ right: enable }}
          handleClasses={{
            right: 'sidebar-resizer',
            bottom: 'hidden',
            bottomRight: 'hidden',
            bottomLeft: 'hidden',
          }}
          size={{ width, height: '100%' }}
          minWidth={minWidth}
          maxWidth={maxWidth}
          onResizeStop={(e, direction, ref, d) => setWidth(width + d.width)}
        />
      </ResizableWrapper>
      {children(width)}
    </>
  );
};

export default ResizableSidebar;
