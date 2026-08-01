import { ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import { tn } from '@zobi/core/translation';
import levenshtein from 'js-levenshtein';

import { List } from '@zobi-ui/core/components';
import { ErrorMessageComponentProps } from './types';
import { IssueCode } from './IssueCode';
import { ErrorAlert } from './ErrorAlert';

interface ParameterErrorExtra {
  undefined_parameters?: string[];
  template_parameters?: object;
  issue_codes: {
    code: number;
    message: string;
  }[];
}

const maxDistanceForSuggestion = 2;
const findMatches = (undefinedParameters: string[], templateKeys: string[]) => {
  const matches: { [undefinedParameter: string]: string[] } = {};
  undefinedParameters.forEach(undefinedParameter => {
    templateKeys.forEach(templateKey => {
      if (
        levenshtein(undefinedParameter, templateKey) <= maxDistanceForSuggestion
      ) {
        if (!matches[undefinedParameter]) {
          matches[undefinedParameter] = [];
        }
        matches[undefinedParameter].push(`"${templateKey}"`);
      }
    });
  });
  return matches;
};

export function ParameterErrorMessage({
  error,
  subtitle,
  closable,
}: ErrorMessageComponentProps<ParameterErrorExtra>) {
  const { extra = { issue_codes: [] }, level, message } = error;

  const triggerMessage = tn(
    'This was triggered by:',
    'This may be triggered by:',
    extra.issue_codes.length,
  );

  const matches = findMatches(
    extra.undefined_parameters || [],
    Object.keys(extra.template_parameters || {}),
  );

  const body = (
    <>
      <p>
        {Object.keys(matches).length > 0 && (
          <>
            <p>{t('Did you mean:')}</p>
            <List
              split={false}
              size="small"
              dataSource={Object.entries(matches)}
              renderItem={([undefinedParameter, templateKeys]) => (
                <List.Item compact>
                  <List.Item.Meta
                    avatar={<span>•</span>}
                    title={tn(
                      '%(suggestion)s instead of "%(undefinedParameter)s?"',
                      '%(firstSuggestions)s or %(lastSuggestion)s instead of "%(undefinedParameter)s"?',
                      templateKeys.length,
                      {
                        suggestion: templateKeys.join(', '),
                        firstSuggestions: templateKeys.slice(0, -1).join(', '),
                        lastSuggestion: templateKeys[templateKeys.length - 1],
                        undefinedParameter,
                      },
                    )}
                  />
                </List.Item>
              )}
            />
            <br />
          </>
        )}
        {triggerMessage}
        <br />
        {extra.issue_codes.length > 0 &&
          extra.issue_codes
            .map<ReactNode>(issueCode => <IssueCode {...issueCode} />)
            .reduce((prev, curr) => [prev, <br />, curr])}
      </p>
    </>
  );
  return (
    <ErrorAlert
      errorType={t('Parameter error')}
      type={level}
      message={message}
      description={subtitle}
      descriptionDetails={body}
      closable={closable}
    />
  );
}
