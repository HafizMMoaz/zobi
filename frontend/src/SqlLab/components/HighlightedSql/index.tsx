import { styled, useTheme } from '@zobi.dev/extension-api/theme';
import { t } from '@zobi.dev/extension-api/translation';
import { ModalTrigger, Tabs } from '@zobi.dev/core/components';
import CodeSyntaxHighlighter from '@zobi.dev/core/components/CodeSyntaxHighlighter';

export interface HighlightedSqlProps {
  sql: string;
  rawSql?: string;
  maxWidth?: number;
  maxLines?: number;
  shrink?: any;
}

interface HighlightedSqlModalTypes {
  rawSql?: string;
  sql: string;
}

interface TriggerNodeProps {
  shrink: boolean;
  sql: string;
  maxLines: number;
  maxWidth: number;
}

const Title = styled.h4`
  font-size: ${({ theme }) => theme.fontSizeLG}px;
  margin: ${({ theme }) => theme.sizeUnit * 2}px 0;
  font-weight: ${({ theme }) => theme.fontWeightStrong};
`;

const StyledTabs = styled(Tabs)`
  margin-top: ${({ theme }) => theme.sizeUnit * -8}px;
  .ant-tabs-nav {
    margin-bottom: ${({ theme }) => theme.sizeUnit * 4}px;
  }
`;

const shrinkSql = (sql: string, maxLines: number, maxWidth: number) => {
  const ssql = sql || '';
  let lines = ssql.split('\n');
  if (lines.length >= maxLines) {
    lines = lines.slice(0, maxLines);
    lines.push('{...}');
  }
  return lines
    .map(line =>
      line.length > maxWidth ? `${line.slice(0, maxWidth)}{...}` : line,
    )
    .join('\n');
};

function TriggerNode({ shrink, sql, maxLines, maxWidth }: TriggerNodeProps) {
  return (
    <CodeSyntaxHighlighter language="sql" showCopyButton={false}>
      {shrink ? shrinkSql(sql, maxLines, maxWidth) : sql}
    </CodeSyntaxHighlighter>
  );
}

function HighlightSqlModal({ rawSql, sql }: HighlightedSqlModalTypes) {
  const theme = useTheme();
  const codeBlockStyle = {
    border: 1,
    borderColor: theme.colorBorder,
    borderStyle: 'solid',
    backgroundColor: theme.colorBgLayout,
    fontSize: theme.fontSize * 0.9,
    padding: theme.sizeUnit * 2,
  };

  const isDifferent = !!rawSql && rawSql !== sql;

  if (!isDifferent) {
    return (
      <div>
        <Title>{t('Source SQL')}</Title>
        <CodeSyntaxHighlighter language="sql" customStyle={codeBlockStyle}>
          {sql}
        </CodeSyntaxHighlighter>
      </div>
    );
  }

  return (
    <StyledTabs
      defaultActiveKey="executed"
      items={[
        {
          key: 'executed',
          label: t('Executed SQL'),
          children: (
            <CodeSyntaxHighlighter language="sql" customStyle={codeBlockStyle}>
              {rawSql!}
            </CodeSyntaxHighlighter>
          ),
        },
        {
          key: 'source',
          label: t('Source SQL'),
          children: (
            <CodeSyntaxHighlighter language="sql" customStyle={codeBlockStyle}>
              {sql}
            </CodeSyntaxHighlighter>
          ),
        },
      ]}
    />
  );
}

function HighlightedSql({
  sql,
  rawSql,
  maxWidth = 50,
  maxLines = 5,
  shrink = false,
}: HighlightedSqlProps) {
  return (
    <ModalTrigger
      modalTitle={t('SQL')}
      modalBody={<HighlightSqlModal rawSql={rawSql} sql={sql} />}
      triggerNode={
        <TriggerNode
          shrink={shrink}
          sql={sql}
          maxLines={maxLines}
          maxWidth={maxWidth}
        />
      }
      responsive
    />
  );
}

export default HighlightedSql;
