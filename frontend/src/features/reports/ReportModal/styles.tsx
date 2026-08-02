import { styled, css, ZobiTheme } from '@zobi.dev/extension-api/theme';
import { Button, CronPicker, Modal } from '@zobi.dev/core/components';
import { Radio } from '@zobi.dev/core/components/Radio';

export const StyledModal = styled(Modal)`
  .ant-modal-body {
    padding: 0;
  }
`;

export const StyledTopSection = styled.div`
  padding: ${({ theme }) =>
    `${theme.sizeUnit * 3}px ${theme.sizeUnit * 4}px ${theme.sizeUnit * 2}px`};
  label {
    font-size: ${({ theme }) => theme.fontSizeSM}px;
    color: ${({ theme }) => theme.colorTextSecondary};
  }
`;

export const StyledBottomSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colorSplit};
  padding: ${({ theme }) =>
    `${theme.sizeUnit * 4}px ${theme.sizeUnit * 4}px ${theme.sizeUnit * 6}px`};
  .ant-select {
    width: 100%;
  }
  .control-label {
    font-size: ${({ theme }) => theme.fontSizeSM}px;
    color: ${({ theme }) => theme.colorTextSecondary};
  }
`;

export const StyledIconWrapper = styled.span`
  span {
    margin-right: ${({ theme }) => theme.sizeUnit * 2}px;
    vertical-align: middle;
  }
  .text {
    vertical-align: middle;
  }
`;

export const StyledScheduleTitle = styled.div`
  margin-bottom: ${({ theme }) => theme.sizeUnit * 7}px;

  h4 {
    margin-bottom: ${({ theme }) => theme.sizeUnit * 3}px;
  }
`;

// Named-reference type annotation: TypeScript 6.0 declaration emit (TS2883)
// can't name CronProps from react-js-cron via its nested node_modules path.
// Aliasing to `typeof CronPicker` emits a named reference in the .d.ts.
export const StyledCronPicker = styled(CronPicker)`
  margin-bottom: ${({ theme }) => theme.sizeUnit * 3}px;
  width: ${({ theme }) => theme.sizeUnit * 120}px;
` as typeof CronPicker;

export const StyledCronError = styled.p`
  color: ${({ theme }) => theme.colorError};
`;

export const noBottomMargin = css`
  margin-bottom: 0;
`;

export const StyledFooterButton = styled(Button)`
  width: ${({ theme }) => theme.sizeUnit * 40}px;
`;

export const TimezoneHeaderStyle = (theme: ZobiTheme) => css`
  margin: ${theme.sizeUnit * 3}px 0 ${theme.sizeUnit * 2}px;
`;

export const CustomWidthHeaderStyle = (theme: ZobiTheme) => css`
  margin: ${theme.sizeUnit * 3}px 0 ${theme.sizeUnit * 2}px;
`;

export const SectionHeaderStyle = (theme: ZobiTheme) => css`
  margin: ${theme.sizeUnit * 3}px 0;
`;

export const StyledMessageContentTitle = styled.div`
  margin: ${({ theme }) => theme.sizeUnit * 8}px 0
    ${({ theme }) => theme.sizeUnit * 4}px;
`;

export const StyledRadio = styled(Radio)`
  display: block;
  line-height: ${({ theme }) => theme.sizeUnit * 8}px;
`;

export const antDErrorAlertStyles = (theme: ZobiTheme) => css`
  margin: ${theme.sizeUnit * 4}px;
  margin-top: 0;
`;
