import { styled } from '@zobi.dev/extension-api/theme';
import {
  MetricOption,
  ColumnOption,
  MetricOptionProps,
  ColumnOptionProps,
} from '@zobi.dev/chart-controls';

const OptionContainer = styled.div`
  width: 100%;
  > span {
    display: flex;
    align-items: center;
  }

  .option-label {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    & ~ i {
      margin-left: ${({ theme }) => theme.sizeUnit}px;
    }
  }
  .type-label {
    margin-right: ${({ theme }) => theme.sizeUnit * 3}px;
    width: ${({ theme }) => theme.sizeUnit * 7}px;
    display: inline-block;
    text-align: center;
    font-weight: ${({ theme }) => theme.fontWeightStrong};
  }
`;

export const StyledMetricOption = (props: MetricOptionProps) => (
  <OptionContainer>
    <MetricOption {...props} />
  </OptionContainer>
);

export const StyledColumnOption = (props: ColumnOptionProps) => (
  <OptionContainer>
    <ColumnOption {...props} />
  </OptionContainer>
);
