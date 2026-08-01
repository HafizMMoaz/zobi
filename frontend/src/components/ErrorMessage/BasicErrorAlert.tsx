import { ErrorLevel } from '@zobi-ui/core';
import {
  styled,
  useTheme,
  getColorVariants,
} from '@zobi/core/theme';
import { Icons } from '@zobi-ui/core/components';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${({ theme }) => theme.sizeUnit * 2}px;
  overflow: hidden;
`;

const StyledTitle = styled.span`
  font-weight: ${({ theme }) => theme.fontWeightStrong};
`;

interface BasicErrorAlertProps {
  title: string;
  body: string;
  level?: ErrorLevel;
}

export function BasicErrorAlert({
  body,
  level = 'error',
  title,
}: BasicErrorAlertProps) {
  const theme = useTheme();
  const variants = getColorVariants(theme, level);
  const style: React.CSSProperties = {
    backgroundColor: variants.bg,
    borderColor: variants.border,
    color: variants.text,
    display: 'flex',
    flexDirection: 'row',
    borderRadius: `${theme.borderRadius}px`,
    padding: `${theme.sizeUnit * 2}px`,
    marginBottom: `${theme.sizeUnit}px`,
    width: '100%',
  };

  return (
    <div style={style} role="alert">
      <Icons.ExclamationCircleFilled iconColor={variants.text} />
      <StyledContent>
        <StyledTitle>{title}</StyledTitle>
        <p>{body}</p>
      </StyledContent>
    </div>
  );
}
