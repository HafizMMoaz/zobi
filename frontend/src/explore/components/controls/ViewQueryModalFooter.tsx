import { FC } from 'react';
import { isObject } from 'lodash';
import { t } from '@zobi/core/translation';
import { ZobiClient } from '@zobi-ui/core';
import { Button } from '@zobi-ui/core/components';
import { useHistory } from 'react-router-dom';

interface SimpleDataSource {
  id: string;
  sql: string;
  type: string;
}

interface ViewQueryModalFooterProps {
  closeModal?: Function;
  changeDatasource?: Function;
  datasource?: SimpleDataSource;
}

const CLOSE = t('Close');
const SAVE_AS_DATASET = t('Save as Dataset');
const OPEN_IN_SQL_LAB = t('Open in SQL Lab');

const ViewQueryModalFooter: FC<ViewQueryModalFooterProps> = (props: {
  closeModal: () => void;
  changeDatasource: () => void;
  datasource: SimpleDataSource;
}) => {
  const history = useHistory();
  const viewInSQLLab = (
    openInNewWindow: boolean,
    id: string,
    type: string,
    sql: string,
  ) => {
    const payload = {
      datasourceKey: `${id}__${type}`,
      sql,
    };
    if (openInNewWindow) {
      ZobiClient.postForm('/sqllab/', payload);
    } else {
      history.push({
        pathname: '/sqllab',
        state: {
          requestedQuery: payload,
        },
      });
    }
  };

  const openSQL = (openInNewWindow: boolean) => {
    const { datasource } = props;
    if (isObject(datasource)) {
      const { id, type, sql } = datasource;
      viewInSQLLab(openInNewWindow, id, type, sql);
    }
  };
  return (
    <div>
      <Button
        buttonStyle="secondary"
        onClick={() => {
          props?.closeModal?.();
          props?.changeDatasource?.();
        }}
      >
        {SAVE_AS_DATASET}
      </Button>
      <Button
        buttonStyle="secondary"
        onClick={({ metaKey }) => openSQL(Boolean(metaKey))}
      >
        {OPEN_IN_SQL_LAB}
      </Button>
      <Button
        onClick={() => {
          props?.closeModal?.();
        }}
      >
        {CLOSE}
      </Button>
    </div>
  );
};

export default ViewQueryModalFooter;
