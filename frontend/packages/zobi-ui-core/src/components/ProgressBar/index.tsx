import { styled } from '@zobi/core-legacy/theme';
import { Progress as AntdProgress } from 'antd';
import { ProgressProps } from 'antd/es/progress/progress';

export interface ProgressBarProps extends ProgressProps {
  striped?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProgressBar = styled(({ striped, ...props }: ProgressBarProps) => (
  <AntdProgress data-test="progress-bar" {...props} />
))`
  position: static;
  .ant-progress-inner {
    position: static;
  }
  .ant-progress-bg {
    position: static;
    ${({ striped }) =>
      striped &&
      `
        background-image: linear-gradient(45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%, transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%, transparent) !important;
        background-size: 1rem 1rem !important;
        `};
  }
`;

export default ProgressBar;
