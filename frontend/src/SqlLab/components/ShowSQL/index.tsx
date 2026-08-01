import { useEffect } from 'react';
import { IconTooltip, ModalTrigger } from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';
import CodeSyntaxHighlighter, {
  preloadLanguages,
} from '@zobi-ui/core/components/CodeSyntaxHighlighter';

interface ShowSQLProps {
  sql: string;
  title: string;
  tooltipText: string;
  triggerNode?: React.ReactNode;
}

export default function ShowSQL({
  tooltipText,
  title,
  sql: sqlString,
  triggerNode,
}: ShowSQLProps) {
  // Preload SQL language since this component will definitely use it when modal opens
  useEffect(() => {
    preloadLanguages(['sql']);
  }, []);

  return (
    <ModalTrigger
      modalTitle={title}
      triggerNode={
        triggerNode || (
          <IconTooltip className="pull-left" tooltip={tooltipText}>
            <Icons.EyeOutlined iconSize="s" />
          </IconTooltip>
        )
      }
      modalBody={
        <div>
          <CodeSyntaxHighlighter language="sql">
            {sqlString}
          </CodeSyntaxHighlighter>
        </div>
      }
    />
  );
}
