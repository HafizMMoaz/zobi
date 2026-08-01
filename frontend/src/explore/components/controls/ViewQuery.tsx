import {
  FC,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import rison from 'rison';
import { t } from '@zobi.dev/extension-api/translation';
import { ZobiClient } from '@zobi.dev/core';
import { styled, useTheme } from '@zobi.dev/extension-api/theme';
import {
  Icons,
  Switch,
  Button,
  Skeleton,
  Card,
  Space,
} from '@zobi.dev/core/components';
import { CopyToClipboard } from 'src/components';
import { RootState } from 'src/dashboard/types';
import { findPermission } from 'src/utils/findPermission';
import { makeUrl } from 'src/utils/pathUtils';
import CodeSyntaxHighlighter, {
  SupportedLanguage,
  preloadLanguages,
} from '@zobi.dev/core/components/CodeSyntaxHighlighter';
import { useHistory } from 'react-router-dom';
import { ExplorePageState } from 'src/explore/types';

export interface ViewQueryProps {
  sql: string;
  datasource: string;
  language?: SupportedLanguage;
}

const StyledSyntaxContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledThemedSyntaxHighlighter = styled(CodeSyntaxHighlighter)`
  flex: 1;
  height: ${({ theme }) => theme.sizeUnit * 26}px;
  margin-top: 0;
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DATASET_BACKEND_QUERY = {
  keys: ['none'],
  columns: ['database.backend'],
};

const ViewQuery: FC<ViewQueryProps> = props => {
  const { sql, language = 'sql', datasource } = props;
  const theme = useTheme();
  const datasetId = datasource?.split('__')[0];
  const exploreBackend = useSelector(
    (state: ExplorePageState) => state.explore?.datasource?.database?.backend,
  );
  const [formattedSQL, setFormattedSQL] = useState<string>();
  const [showFormatSQL, setShowFormatSQL] = useState(true);
  const history = useHistory();
  const currentSQL = (showFormatSQL ? formattedSQL : sql) ?? sql;
  const canAccessSQLLab = useSelector((state: RootState) =>
    findPermission('menu_access', 'SQL Lab', state.user?.roles),
  );

  // Preload the language when component mounts to ensure smooth experience
  useEffect(() => {
    preloadLanguages([language]);
  }, [language]);

  const formatCurrentQuery = useCallback(async () => {
    if (formattedSQL) {
      setShowFormatSQL(val => !val);
      return;
    }
    try {
      let backend = exploreBackend;

      // Fetch backend info if not available in Redux state
      if (!backend) {
        const queryParams = rison.encode(DATASET_BACKEND_QUERY);
        const response = await ZobiClient.get({
          endpoint: `/api/v1/dataset/${datasetId}?q=${queryParams}`,
        });
        const { backend: datasetBackend } = response.json.result.database;
        backend = datasetBackend;
      }

      // Format the SQL query
      const formatResponse = await ZobiClient.post({
        endpoint: `/api/v1/sqllab/format_sql/`,
        body: JSON.stringify({
          sql,
          engine: backend,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      setFormattedSQL(formatResponse.json.result);
      setShowFormatSQL(true);
    } catch (error) {
      setShowFormatSQL(false);
    }
  }, [sql, datasetId, formattedSQL]);

  const navToSQLLab = useCallback(
    (domEvent: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>) => {
      const requestedQuery = {
        datasourceKey: datasource,
        sql: currentSQL,
      };
      if (domEvent.metaKey || domEvent.ctrlKey) {
        domEvent.preventDefault();
        window.open(
          makeUrl(
            `/sqllab?datasourceKey=${datasource}&sql=${encodeURIComponent(currentSQL)}`,
          ),
          '_blank',
        );
      } else {
        history.push({ pathname: '/sqllab', state: { requestedQuery } });
      }
    },
    [history, datasource, currentSQL],
  );

  useEffect(() => {
    formatCurrentQuery();
  }, [sql]);

  return (
    <Card bodyStyle={{ padding: theme.sizeUnit * 4 }}>
      <StyledSyntaxContainer key={sql}>
        {!formattedSQL && showFormatSQL ? (
          <Skeleton active />
        ) : (
          <StyledThemedSyntaxHighlighter
            language={language}
            customStyle={{
              flex: 1,
              marginBottom: theme.sizeUnit * 3,
              fontSize: theme.fontSize * 0.75,
              padding: 0,
            }}
          >
            {currentSQL}
          </StyledThemedSyntaxHighlighter>
        )}

        <StyledFooter>
          <Space size={theme.sizeUnit * 2}>
            <CopyToClipboard
              text={currentSQL}
              shouldShowText={false}
              copyNode={
                <Button
                  buttonStyle="secondary"
                  buttonSize="small"
                  icon={<Icons.CopyOutlined />}
                >
                  {t('Copy')}
                </Button>
              }
            />
            {canAccessSQLLab && (
              <Button
                buttonStyle="secondary"
                buttonSize="small"
                onClick={navToSQLLab}
              >
                {t('View in SQL Lab')}
              </Button>
            )}
          </Space>

          <Space size={theme.sizeUnit * 2} align="center">
            <Icons.ConsoleSqlOutlined />
            <Switch
              id="formatSwitch"
              checked={showFormatSQL}
              onChange={formatCurrentQuery}
              checkedChildren={t('formatted')}
              unCheckedChildren={t('original')}
            />
          </Space>
        </StyledFooter>
      </StyledSyntaxContainer>
    </Card>
  );
};

export default ViewQuery;
