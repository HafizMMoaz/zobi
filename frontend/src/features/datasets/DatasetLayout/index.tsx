import { ReactElement, JSXElementConstructor } from 'react';
import { useTheme } from '@zobi/core/theme';
import ResizableSidebar from 'src/components/ResizableSidebar';

import {
  StyledLayoutWrapper,
  LeftColumn,
  RightColumn,
  OuterRow,
  PanelRow,
  FooterRow,
  StyledLayoutHeader,
  StyledLayoutLeftPanel,
  StyledLayoutDatasetPanel,
  StyledLayoutRightPanel,
  StyledLayoutFooter,
} from '../styles';

interface DatasetLayoutProps {
  header?: ReactElement<any, string | JSXElementConstructor<any>> | null;
  leftPanel?: ReactElement<any, string | JSXElementConstructor<any>> | null;
  datasetPanel?: ReactElement<any, string | JSXElementConstructor<any>> | null;
  rightPanel?: ReactElement<any, string | JSXElementConstructor<any>> | null;
  footer?: ReactElement<any, string | JSXElementConstructor<any>> | null;
}

export default function DatasetLayout({
  header,
  leftPanel,
  datasetPanel,
  rightPanel,
  footer,
}: DatasetLayoutProps) {
  const theme = useTheme();

  return (
    <StyledLayoutWrapper data-test="dataset-layout-wrapper">
      {header && <StyledLayoutHeader>{header}</StyledLayoutHeader>}
      <OuterRow>
        {leftPanel && (
          <ResizableSidebar
            id="dataset"
            initialWidth={theme.sizeUnit * 80}
            minWidth={theme.sizeUnit * 80}
            enable
          >
            {adjustedWidth => (
              <LeftColumn width={adjustedWidth}>
                <StyledLayoutLeftPanel>{leftPanel}</StyledLayoutLeftPanel>
              </LeftColumn>
            )}
          </ResizableSidebar>
        )}
        <RightColumn>
          <PanelRow>
            {datasetPanel && (
              <StyledLayoutDatasetPanel>
                {datasetPanel}
              </StyledLayoutDatasetPanel>
            )}
            {rightPanel && (
              <StyledLayoutRightPanel>{rightPanel}</StyledLayoutRightPanel>
            )}
          </PanelRow>

          <FooterRow>
            {footer && <StyledLayoutFooter>{footer}</StyledLayoutFooter>}
          </FooterRow>
        </RightColumn>
      </OuterRow>
    </StyledLayoutWrapper>
  );
}
