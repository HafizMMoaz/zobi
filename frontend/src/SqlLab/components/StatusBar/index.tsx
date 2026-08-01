import { styled } from '@zobi/core/theme';
import { Flex } from '@zobi-ui/core/components';
import ViewListExtension from 'src/components/ViewListExtension';
import { views } from 'src/core';
import { SQL_EDITOR_STATUSBAR_HEIGHT } from 'src/SqlLab/constants';
import { ViewLocations } from 'src/SqlLab/contributions';

const Container = styled(Flex)`
  flex-direction: row-reverse;
  height: ${SQL_EDITOR_STATUSBAR_HEIGHT}px;
  background-color: ${({ theme }) => theme.colorPrimary};
  color: ${({ theme }) => theme.colorWhite};
  padding: 0 ${({ theme }) => theme.sizeUnit * 4}px;

  & .ant-tag {
    color: ${({ theme }) => theme.colorWhite};
    background-color: transparent;
    border: 0;
  }
`;

const StatusBar = () => {
  const statusBarViews = views.getViews(ViewLocations.sqllab.statusBar) || [];

  return (
    <>
      {statusBarViews.length > 0 && (
        <Container align="center" justify="space-between">
          <ViewListExtension viewId={ViewLocations.sqllab.statusBar} />
        </Container>
      )}
    </>
  );
};

export default StatusBar;
