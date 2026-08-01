import { JSONTree } from 'react-json-tree';
import { t } from '@zobi.dev/extension-api/translation';
import { useJsonTreeTheme } from 'src/hooks/useJsonTreeTheme';
import { Collapse, List, Typography } from '@zobi.dev/core/components';
import type { ErrorMessageComponentProps } from './types';

interface MarshmallowErrorExtra {
  messages: object;
  payload: object;
  issue_codes: {
    code: number;
    message: string;
  }[];
}

const extractInvalidValues = (messages: object, payload: object): string[] => {
  const invalidValues: string[] = [];

  const recursiveExtract = (
    messages: Record<string, any>,
    payload: Record<string, any>,
  ) => {
    Object.keys(messages).forEach(key => {
      const value = payload[key];
      const message = messages[key];

      if (Array.isArray(message)) {
        message.forEach(errorMessage => {
          invalidValues.push(`${errorMessage}: ${value}`);
        });
      } else {
        recursiveExtract(message, value);
      }
    });
  };
  recursiveExtract(
    messages as Record<string, any>,
    payload as Record<string, any>,
  );
  return invalidValues;
};

export function MarshmallowErrorMessage({
  error,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  source = 'crud',
  subtitle,
}: ErrorMessageComponentProps<MarshmallowErrorExtra>) {
  const jsonTreeTheme = useJsonTreeTheme();
  const { extra, message } = error;

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}

      {message}

      <List
        size="small"
        dataSource={extractInvalidValues(extra.messages, extra.payload)}
        renderItem={(value, index) => (
          <List.Item key={index}>
            <Typography.Text>{value}</Typography.Text>
          </List.Item>
        )}
      />

      <Collapse
        ghost
        items={[
          {
            label: t('Details'),
            key: 'details',
            children: (
              <JSONTree
                data={extra.messages}
                shouldExpandNodeInitially={() => true}
                hideRoot
                theme={jsonTreeTheme}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
