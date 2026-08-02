import { t } from '@zobi.dev/extension-api/translation';
import type { ErrorMessageComponentProps } from './types';
import { ErrorAlert } from './ErrorAlert';

interface ZobiParseErrorExtra {
  sql: string;
  engine: string | null;
  line: number | null;
  column: number | null;
}

/*
 * Component for showing syntax errors in SQL Lab.
 */
export function InvalidSQLErrorMessage({
  error,
  subtitle,
  closable,
}: ErrorMessageComponentProps<ZobiParseErrorExtra>) {
  const { extra, level, message } = error;

  const { sql, line, column } = extra;
  const lines = sql?.split('\n');
  let errorLine;
  if (line !== null && Number.isInteger(line)) errorLine = lines[line - 1];
  else if (lines?.length > 0) {
    errorLine = lines[0];
  }
  const body = errorLine ? (
    <>
      <pre>{errorLine}</pre>
      {column !== null && <pre>{' '.repeat(column - 1)}^</pre>}
    </>
  ) : (
    message
  );
  return (
    <ErrorAlert
      errorType={t('Unable to parse SQL')}
      message={subtitle}
      type={level}
      description={body}
      closable={closable}
    />
  );
}
