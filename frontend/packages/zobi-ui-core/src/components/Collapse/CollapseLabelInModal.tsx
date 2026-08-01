import { useTheme, css } from '@zobi/core-legacy/theme';
import { Typography } from '@zobi-ui/core/components/Typography';
import { Icons } from '@zobi-ui/core/components';

interface CollapseLabelInModalProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  validateCheckStatus?: boolean;
  testId?: string;
}

export const CollapseLabelInModal: React.FC<CollapseLabelInModalProps> = ({
  title,
  subtitle,
  validateCheckStatus,
  testId,
}) => {
  const theme = useTheme();

  return (
    <div data-test={testId}>
      <Typography.Title
        css={css`
          && {
            margin-top: 0;
            margin-bottom: ${theme.sizeUnit / 2}px;
            font-size: ${theme.fontSizeLG}px;
          }
        `}
      >
        {title}{' '}
        {validateCheckStatus !== undefined &&
          (validateCheckStatus ? (
            <Icons.CheckCircleOutlined iconColor={theme.colorSuccess} />
          ) : (
            <Icons.ExclamationCircleOutlined iconColor={theme.colorError} />
          ))}
      </Typography.Title>
      <Typography.Paragraph
        css={css`
          margin: 0;
          font-size: ${theme.fontSizeSM}px;
          color: ${theme.colorTextDescription};
        `}
      >
        {subtitle}
      </Typography.Paragraph>
    </div>
  );
};

export type { CollapseLabelInModalProps };
