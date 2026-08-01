import { FC, Fragment, useEffect, useState } from 'react';

import { t } from '@zobi/core/translation';
import {
  ensureIsArray,
  getClientErrorObject,
  QueryFormData,
} from '@zobi-ui/core';
import { Alert } from '@zobi/core/components';
import { styled } from '@zobi/core/theme';
import { Loading } from '@zobi-ui/core/components';
import { SupportedLanguage } from '@zobi-ui/core/components/CodeSyntaxHighlighter';
import { getChartDataRequest } from 'src/components/Chart/chartAction';
import ViewQuery from 'src/explore/components/controls/ViewQuery';

interface Props {
  latestQueryFormData: QueryFormData;
}

type Result = {
  query?: string;
  language: SupportedLanguage;
  error?: string;
};

const ViewQueryModalContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.sizeUnit * 4}px;
`;

const ViewQueryModal: FC<Props> = ({ latestQueryFormData }) => {
  const [result, setResult] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChartData = (resultType: string) => {
    setIsLoading(true);
    getChartDataRequest({
      formData: latestQueryFormData,
      resultFormat: 'json',
      resultType,
    })
      .then(({ json }) => {
        setResult(ensureIsArray(json.result) as Result[]);
        setIsLoading(false);
        setError(null);
      })
      .catch(response => {
        getClientErrorObject(response).then(({ error, message }) => {
          setError(
            error ||
              message ||
              response.statusText ||
              t('Sorry, An error occurred'),
          );
          setIsLoading(false);
        });
      });
  };
  useEffect(() => {
    loadChartData('query');
  }, [JSON.stringify(latestQueryFormData)]);

  if (isLoading) {
    return <Loading />;
  }
  if (error) {
    return <pre>{error}</pre>;
  }

  return (
    <ViewQueryModalContainer>
      {result.map((item, index) => (
        // Static API response data - index is appropriate for keys
        <Fragment key={index}>
          {item.error && (
            <Alert type="error" message={item.error} closable={false} />
          )}
          {item.query && (
            <ViewQuery
              datasource={latestQueryFormData.datasource}
              sql={item.query}
              language={item.language}
            />
          )}
        </Fragment>
      ))}
    </ViewQueryModalContainer>
  );
};

export default ViewQueryModal;
