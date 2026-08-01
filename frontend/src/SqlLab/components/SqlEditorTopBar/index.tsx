import { Flex } from '@zobi-ui/core/components';
import { styled } from '@zobi/core/theme';
import { MenuItemType } from '@zobi-ui/core/components/Menu';
import { ViewLocations } from 'src/SqlLab/contributions';
import PanelToolbar from 'src/components/PanelToolbar';

const StyledFlex = styled(Flex)`
  margin-bottom: ${({ theme }) => theme.sizeUnit * 2}px;
  padding: ${({ theme }) => theme.sizeUnit}px 0;
`;

export interface SqlEditorTopBarProps {
  queryEditorId: string;
  defaultPrimaryActions: React.ReactNode;
  defaultSecondaryActions: MenuItemType[];
}

const SqlEditorTopBar = ({
  defaultPrimaryActions,
  defaultSecondaryActions,
}: SqlEditorTopBarProps) => (
  <StyledFlex justify="space-between" gap="small" id="js-sql-toolbar">
    <Flex gap="small" align="center">
      <Flex gap="small" align="center">
        <PanelToolbar
          viewId={ViewLocations.sqllab.editor}
          defaultPrimaryActions={defaultPrimaryActions}
          defaultSecondaryActions={defaultSecondaryActions}
        />
      </Flex>
    </Flex>
  </StyledFlex>
);

export default SqlEditorTopBar;
