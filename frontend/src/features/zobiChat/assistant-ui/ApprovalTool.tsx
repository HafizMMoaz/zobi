import { FC } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { ToolRisk } from '../types';

export type ApprovalToolArgs = {
  name: string;
  title: string;
  risk: ToolRisk;
  description: string;
  arguments: Record<string, unknown>;
};

export type ApprovalToolProps = {
  args: ApprovalToolArgs;
  result: { approved: boolean } | undefined;
  addResult: (result: { approved: boolean }) => void;
};

/**
 * Renderer for `request_approval` tool-call parts: an amber prompt with
 * Approve/Decline buttons while `result` is unset, and a plain outcome line
 * once `addResult` (wired through to `runtime.ts`'s `onAddToolResult`) has
 * settled it.
 */
const ApprovalTool: FC<ApprovalToolProps> = ({ args, result, addResult }) => {
  if (result) {
    return (
      <div className="aui:my-2 aui:rounded-lg aui:border aui:p-3 aui:text-sm">
        {result.approved ? t('Approved') : t('Declined')}: {args.title}
      </div>
    );
  }

  return (
    <div className="aui:my-2 aui:rounded-lg aui:border aui:border-amber-400 aui:p-3 aui:text-sm">
      <p className="aui:font-medium">{args.title}</p>
      <p className="aui:text-gray-600">{args.description}</p>
      <div className="aui:mt-2 aui:flex aui:gap-2">
        <button
          type="button"
          className="aui:rounded aui:bg-green-600 aui:px-3 aui:py-1 aui:text-white"
          onClick={() => addResult({ approved: true })}
        >
          {t('Approve')}
        </button>
        <button
          type="button"
          className="aui:rounded aui:bg-gray-200 aui:px-3 aui:py-1"
          onClick={() => addResult({ approved: false })}
        >
          {t('Decline')}
        </button>
      </div>
    </div>
  );
};

export default ApprovalTool;
