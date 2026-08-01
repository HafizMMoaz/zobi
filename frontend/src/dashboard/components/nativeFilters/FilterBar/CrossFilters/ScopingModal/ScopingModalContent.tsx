import { NativeFilterScope } from '@zobi.dev/core';
import { css, styled, useTheme } from '@zobi.dev/extension-api/theme';
import { ChartConfiguration } from 'src/dashboard/types';
import { ScopingTreePanel } from './ScopingTreePanel';
import { ChartsScopingListPanel } from './ChartsScopingListPanel';

export interface ScopingModalContentProps {
  chartId: number | undefined;
  currentScope: NativeFilterScope;
  onScopeUpdate: ({ scope }: { scope: NativeFilterScope }) => void;
  onSelectChange: (chartId: number) => void;
  chartConfigs: ChartConfiguration;
  setCurrentChartId: (chartId: number | undefined) => void;
  removeCustomScope: (chartId: number) => void;
  addNewCustomScope: () => void;
}

const ModalContentContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    height: 100%;
    & > div {
      padding: ${theme.sizeUnit * 4}px;
    }
  `}
`;

export const ScopingModalContent = ({
  chartId,
  currentScope,
  onScopeUpdate,
  onSelectChange,
  chartConfigs,
  setCurrentChartId,
  removeCustomScope,
  addNewCustomScope,
}: ScopingModalContentProps) => {
  const theme = useTheme();
  return (
    <ModalContentContainer>
      <div
        css={css`
          width: 35%;
          border-right: 1px solid ${theme.colorSplit};
        `}
        data-test="scoping-list-panel"
      >
        <ChartsScopingListPanel
          setCurrentChartId={setCurrentChartId}
          activeChartId={chartId}
          chartConfigs={chartConfigs}
          removeCustomScope={removeCustomScope}
          addNewCustomScope={addNewCustomScope}
        />
      </div>
      <ScopingTreePanel
        chartId={chartId}
        currentScope={currentScope}
        onScopeUpdate={onScopeUpdate}
        onSelectChange={onSelectChange}
        chartConfigs={chartConfigs}
      />
    </ModalContentContainer>
  );
};
