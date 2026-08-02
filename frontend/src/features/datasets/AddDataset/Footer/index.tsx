import { useHistory } from 'react-router-dom';
import { Button, DropdownButton, Menu, Flex } from '@zobi.dev/core/components';
import { t } from '@zobi.dev/extension-api/translation';
import { useTheme } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { useSingleViewResource } from 'src/views/CRUD/hooks';
import { logEvent } from 'src/logger/actions';
import withToasts from 'src/components/MessageToasts/withToasts';
import {
  LOG_ACTIONS_DATASET_CREATION_EMPTY_CANCELLATION,
  LOG_ACTIONS_DATASET_CREATION_DATABASE_CANCELLATION,
  LOG_ACTIONS_DATASET_CREATION_SCHEMA_CANCELLATION,
  LOG_ACTIONS_DATASET_CREATION_TABLE_CANCELLATION,
  LOG_ACTIONS_DATASET_CREATION_SUCCESS,
} from 'src/logger/LogUtils';
import { DatasetObject } from '../types';

interface FooterProps {
  url: string;
  addDangerToast: () => void;
  datasetObject?: Partial<DatasetObject> | null;
  onDatasetAdd?: (dataset: DatasetObject) => void;
  hasColumns?: boolean;
  datasets?: (string | null | undefined)[] | undefined;
}

const INPUT_FIELDS = ['db', 'schema', 'table_name'];
const LOG_ACTIONS = [
  LOG_ACTIONS_DATASET_CREATION_EMPTY_CANCELLATION,
  LOG_ACTIONS_DATASET_CREATION_DATABASE_CANCELLATION,
  LOG_ACTIONS_DATASET_CREATION_SCHEMA_CANCELLATION,
  LOG_ACTIONS_DATASET_CREATION_TABLE_CANCELLATION,
];

function Footer({
  datasetObject,
  addDangerToast,
  hasColumns = false,
  datasets,
}: FooterProps) {
  const history = useHistory();
  const theme = useTheme();
  const { createResource, state } = useSingleViewResource<
    Partial<DatasetObject>
  >('dataset', t('dataset'), addDangerToast);
  const { loading } = state;

  const createLogAction = (dataset: Partial<DatasetObject>) => {
    let totalCount = 0;
    const value = Object.keys(dataset).reduce((total, key) => {
      if (INPUT_FIELDS.includes(key) && dataset[key as keyof DatasetObject]) {
        totalCount += 1;
      }
      return totalCount;
    }, 0);

    return LOG_ACTIONS[value];
  };

  const cancelButtonOnClick = () => {
    if (!datasetObject) {
      logEvent(LOG_ACTIONS_DATASET_CREATION_EMPTY_CANCELLATION, {});
    } else {
      const logAction = createLogAction(datasetObject);
      logEvent(logAction, datasetObject);
    }
    history.goBack();
  };

  const tooltipText = t('Select a database table.');

  const onSave = (createChart: boolean = true) => {
    if (datasetObject) {
      const data = {
        database: datasetObject.db?.id,
        catalog: datasetObject.catalog,
        schema: datasetObject.schema,
        table_name: datasetObject.table_name,
      };
      createResource(data).then(response => {
        if (!response) {
          return;
        }
        if (typeof response === 'number') {
          logEvent(LOG_ACTIONS_DATASET_CREATION_SUCCESS, datasetObject);
          // When a dataset is created the response we get is its ID number
          if (createChart) {
            history.push(`/chart/add/?dataset=${datasetObject.table_name}`);
          } else {
            history.push('/tablemodelview/list/');
          }
        }
      });
    }
  };

  const onSaveOnly = () => {
    onSave(false);
  };

  const CREATE_DATASET_TEXT = t('Create and explore dataset');
  const CREATE_DATASET_ONLY_TEXT = t('Create dataset');
  const disabledCheck =
    !datasetObject?.table_name ||
    !hasColumns ||
    datasets?.includes(datasetObject?.table_name);

  const dropdownMenu = (
    <Menu
      items={[
        {
          key: 'create-only',
          onClick: onSaveOnly,
          label: CREATE_DATASET_ONLY_TEXT,
        },
      ]}
    />
  );

  return (
    <Flex align="center" justify="flex-end" gap="8px">
      <Button buttonStyle="secondary" onClick={cancelButtonOnClick}>
        {t('Cancel')}
      </Button>
      <DropdownButton
        type="primary"
        disabled={disabledCheck}
        loading={loading}
        tooltip={!datasetObject?.table_name ? tooltipText : undefined}
        onClick={() => onSave(true)}
        popupRender={() => dropdownMenu}
        icon={
          <Icons.DownOutlined
            iconSize="xs"
            iconColor={theme.colorTextLightSolid}
          />
        }
        trigger={['click']}
      >
        {CREATE_DATASET_TEXT}
      </DropdownButton>
    </Flex>
  );
}

export default withToasts(Footer);
