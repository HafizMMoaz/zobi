import { useEffect, Dispatch, useCallback } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import TableSelector, { TableOption } from 'src/components/TableSelector';
import { EmptyState } from '@zobi.dev/core/components';
import { type DatabaseObject } from 'src/components';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { LocalStorageKeys, getItem } from 'src/utils/localStorageHelpers';
import {
  DatasetActionType,
  DatasetObject,
  DSReducerActionType,
} from 'src/features/datasets/AddDataset/types';
import { Table } from 'src/hooks/apiResources';
import { Typography } from '@zobi.dev/core/components/Typography';
import { ensureAppRoot } from 'src/utils/pathUtils';

interface LeftPanelProps {
  // This is a reducer dispatch, not a setState setter: every call site passes a
  // DSReducerActionType. Matches the Header component's prop.
  setDataset: Dispatch<DSReducerActionType>;
  dataset?: Partial<DatasetObject> | null;
  datasetNames?: (string | null | undefined)[] | undefined;
}

const LeftPanelStyle = styled.div`
  ${({ theme }) => `
    padding: ${theme.sizeUnit * 4}px;
    height: 100%;
    background-color: ${theme.colorBgContainer};
    position: relative;
    .emptystate {
      height: auto;
      margin-top: ${theme.sizeUnit * 17.5}px;
    }
    .section-title {
      margin-top: ${theme.sizeUnit * 5.5}px;
      margin-bottom: ${theme.sizeUnit * 11}px;
      font-weight: ${theme.fontWeightStrong};
    }
    .table-title {
      margin-top: ${theme.sizeUnit * 11}px;
      margin-bottom: ${theme.sizeUnit * 6}px;
      font-weight: ${theme.fontWeightStrong};
    }
    .options-list {
      overflow: auto;
      position: absolute;
      bottom: 0;
      top: ${theme.sizeUnit * 92.25}px;
      left: ${theme.sizeUnit * 3.25}px;
      right: 0;

      .no-scrollbar {
        margin-right: ${theme.sizeUnit * 4}px;
      }

      .options {
        cursor: pointer;
        padding: ${theme.sizeUnit * 1.75}px;
        border-radius: ${theme.borderRadius}px;
        :hover {
          background-color: ${theme.colorFillTertiary}
        }
      }

      .options-highlighted {
        cursor: pointer;
        padding: ${theme.sizeUnit * 1.75}px;
        border-radius: ${theme.borderRadius}px;
        background-color: ${theme.colorPrimaryText};
        color: ${theme.colorTextLightSolid};
      }

      .options, .options-highlighted {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
    form > span[aria-label="refresh"] {
      position: absolute;
      top: ${theme.sizeUnit * 69}px;
      left: ${theme.sizeUnit * 42.75}px;
      font-size: ${theme.sizeUnit * 4.25}px;
    }
    .table-form {
      margin-bottom: ${theme.sizeUnit * 8}px;
    }
    .loading-container {
      position: absolute;
      top: ${theme.sizeUnit * 89.75}px;
      left: 0;
      right: 0;
      text-align: center;
      img {
        width: ${theme.sizeUnit * 20}px;
        margin-bottom: ${theme.sizeUnit * 2.5}px;
      }
      p {
        color: ${theme.colorTextSecondary};
      }
    }
`}
`;

export default function LeftPanel({
  setDataset,
  dataset,
  datasetNames,
}: LeftPanelProps) {
  const { addDangerToast } = useToasts();

  const setDatabase = useCallback(
    (db: Partial<DatabaseObject>) => {
      // TableSelector yields a Partial<DatabaseObject>, while DatasetObject
      // declares `db` as a complete DatabaseObject & { owners: [number] }.
      // Only `db.id` is read downstream, so the declared shape is stricter than
      // what this flow actually needs.
      setDataset({
        type: DatasetActionType.SelectDatabase,
        payload: { db: db as DatasetObject['db'] },
      });
    },
    [setDataset],
  );
  const setCatalog = (catalog: string | null) => {
    if (catalog) {
      setDataset({
        type: DatasetActionType.SelectCatalog,
        payload: { name: 'catalog', value: catalog },
      });
    }
  };
  const setSchema = (schema: string) => {
    if (schema) {
      setDataset({
        type: DatasetActionType.SelectSchema,
        payload: { name: 'schema', value: schema },
      });
    }
  };
  const setTable = (tableName: string) => {
    setDataset({
      type: DatasetActionType.SelectTable,
      payload: { name: 'table_name', value: tableName },
    });
  };
  useEffect(() => {
    const currentUserSelectedDb = getItem(
      LocalStorageKeys.Database,
      null,
    ) as DatabaseObject;
    if (currentUserSelectedDb) {
      setDatabase(currentUserSelectedDb);
    }
  }, [setDatabase]);

  const customTableOptionLabelRenderer = useCallback(
    (table: Table) => (
      <TableOption
        table={
          datasetNames?.includes(table.value)
            ? {
                ...table,
                extra: {
                  warning_markdown: t('This table already has a dataset'),
                },
              }
            : table
        }
      />
    ),
    [datasetNames],
  );
  const getDatabaseEmptyState = (emptyResultsWithSearch: boolean) => (
    <EmptyState
      image="empty.svg"
      title={
        emptyResultsWithSearch
          ? t('No databases match your search')
          : t('No databases available')
      }
      description={
        <span>
          {t('Manage your databases')}{' '}
          <Typography.Link href={ensureAppRoot('/databaseview/list')}>
            {t('here')}
          </Typography.Link>
        </span>
      }
      size="small"
    />
  );

  return (
    <LeftPanelStyle>
      <TableSelector
        database={dataset?.db}
        handleError={addDangerToast}
        emptyState={getDatabaseEmptyState(false)}
        onDbChange={setDatabase}
        onCatalogChange={setCatalog}
        onSchemaChange={setSchema}
        onTableSelectChange={setTable}
        customTableOptionLabelRenderer={customTableOptionLabelRenderer}
        {...(dataset?.catalog && { catalog: dataset.catalog })}
        {...(dataset?.schema && { schema: dataset.schema })}
      />
    </LeftPanelStyle>
  );
}
