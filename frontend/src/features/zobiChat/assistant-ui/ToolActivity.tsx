import { FC } from 'react';
import { t } from '@zobi.dev/extension-api/translation';

export type ToolActivityProps = {
  toolName: string;
  args: Record<string, unknown>;
  result?: { ok: boolean; output?: string };
};

/**
 * Presentational view of one backend-executed tool call. `result` is absent
 * while the call is still in flight (a `tool_start` with no `tool_result`
 * yet), so its presence - not a client-side `execute` - is what distinguishes
 * running from settled.
 */
const ToolActivity: FC<ToolActivityProps> = ({ toolName, args, result }) => (
  <div className="aui:my-2 aui:rounded-lg aui:border aui:p-3 aui:text-sm">
    <div className="aui:flex aui:items-center aui:justify-between">
      <span className="aui:font-medium">{toolName}</span>
      {!result && <span className="aui:text-gray-500">{t('Running…')}</span>}
      {result && (
        <span className={result.ok ? 'aui:text-green-600' : 'aui:text-red-600'}>
          {result.ok ? t('Done') : t('Failed')}
        </span>
      )}
    </div>
    {Object.keys(args).length > 0 && (
      <pre className="aui:mt-1 aui:overflow-x-auto aui:text-xs aui:text-gray-500">
        {JSON.stringify(args, null, 2)}
      </pre>
    )}
    {result?.output && <p className="aui:mt-1">{result.output}</p>}
  </div>
);

export default ToolActivity;
