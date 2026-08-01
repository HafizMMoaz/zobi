import { useSelector } from 'react-redux';
import { noop } from 'lodash';
import type { SqlLabRootState } from 'src/SqlLab/types';
import { css, styled } from '@zobi.dev/extension-api/theme';
import { useComponentDidUpdate } from '@zobi.dev/core';
import { Grid } from '@zobi.dev/core/components';
import { views } from 'src/core';
import { Splitter } from 'src/components/Splitter';
import useEffectEvent from 'src/hooks/useEffectEvent';
import useStoredSidebarWidth from 'src/components/ResizableSidebar/useStoredSidebarWidth';
import {
  SQL_EDITOR_LEFTBAR_WIDTH,
  SQL_EDITOR_RIGHTBAR_WIDTH,
} from 'src/SqlLab/constants';
import { ViewLocations } from 'src/SqlLab/contributions';
import ViewListExtension from 'src/components/ViewListExtension';

import SqlEditorLeftBar from '../SqlEditorLeftBar';
import StatusBar from '../StatusBar';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  & .ant-splitter-panel:not(.sqllab-body):not(.queryPane) {
    background-color: ${({ theme }) => theme.colorBgBase};
  }

  & .sqllab-body {
    flex-grow: 1 !important;
    padding-top: ${({ theme }) => theme.sizeUnit * 2.5}px;
  }
`;

const StyledSidebar = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.sizeUnit * 2.5}px 0;
  margin: 0 ${({ theme }) => theme.sizeUnit * 2.5}px;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.colorBgBase};
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow: auto;
`;

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const queryEditorId = useSelector<SqlLabRootState, string>(
    ({ sqlLab: { tabHistory } }) => tabHistory.slice(-1)[0],
  );
  const { md } = Grid.useBreakpoint();
  const [leftWidth, setLeftWidth] = useStoredSidebarWidth(
    'sqllab:leftbar',
    SQL_EDITOR_LEFTBAR_WIDTH,
  );
  const [rightWidth, setRightWidth] = useStoredSidebarWidth(
    'sqllab:rightbar',
    SQL_EDITOR_RIGHTBAR_WIDTH,
  );
  const autoHide = useEffectEvent(() => {
    if (leftWidth > 0) {
      setLeftWidth(0);
    }
  });
  useComponentDidUpdate(() => {
    if (!md) {
      autoHide();
    }
  }, [md]);
  const onSidebarChange = (sizes: number[]) => {
    const [updatedWidth, _, possibleRightWidth] = sizes;
    setLeftWidth(updatedWidth);

    if (typeof possibleRightWidth === 'number') {
      setRightWidth(possibleRightWidth);
    }
  };
  const viewItems = views.getViews(ViewLocations.sqllab.rightSidebar) || [];

  return (
    <StyledContainer>
      <Splitter
        css={css`
          flex: 1;
        `}
        lazy
        onResizeEnd={onSidebarChange}
        onResize={noop}
      >
        <Splitter.Panel
          collapsible={{
            start: true,
            end: true,
            showCollapsibleIcon: true,
          }}
          size={leftWidth}
          min={SQL_EDITOR_LEFTBAR_WIDTH}
        >
          <StyledSidebar>
            <SqlEditorLeftBar
              key={queryEditorId}
              queryEditorId={queryEditorId}
            />
          </StyledSidebar>
        </Splitter.Panel>
        <Splitter.Panel className="sqllab-body">{children}</Splitter.Panel>
        {viewItems.length > 0 && (
          <Splitter.Panel
            collapsible={{
              start: true,
              end: true,
              showCollapsibleIcon: true,
            }}
            size={rightWidth}
            min={SQL_EDITOR_RIGHTBAR_WIDTH}
          >
            <ContentWrapper>
              <ViewListExtension viewId={ViewLocations.sqllab.rightSidebar} />
            </ContentWrapper>
          </Splitter.Panel>
        )}
      </Splitter>
      <StatusBar />
    </StyledContainer>
  );
};

export default AppLayout;
