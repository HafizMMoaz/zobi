import { Icons } from '@zobi-ui/core/components';
import { t } from '@zobi/core/translation';
import { useTheme } from '@zobi/core/theme';

interface IssueCodeProps {
  code: number;
  message: string;
}

export function IssueCode({ code, message }: IssueCodeProps) {
  const theme = useTheme();
  return (
    <>
      {message}{' '}
      <a
        href={`https://zobi.dev/docs/using-zobi/issue-codes#issue-${code}`}
        rel="noopener noreferrer"
        target="_blank"
        aria-label={t('Zobi docs link')}
      >
        <Icons.Full iconSize="m" iconColor={theme.colorPrimary} />
      </a>
    </>
  );
}
