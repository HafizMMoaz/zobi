import { useEffect, useMemo, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import {
  useChartEditModal,
  useFavoriteStatus,
  useListViewResource,
} from 'src/views/CRUD/hooks';
import {
  getItem,
  LocalStorageKeys,
  setItem,
} from 'src/utils/localStorageHelpers';
import withToasts from 'src/components/MessageToasts/withToasts';
import { useHistory } from 'react-router-dom';
import { Filter, TableTab } from 'src/views/CRUD/types';
import PropertiesModal from 'src/explore/components/PropertiesModal';
import { User } from 'src/types/bootstrapTypes';
import {
  CardContainer,
  getFilterValues,
  PAGE_SIZE,
} from 'src/views/CRUD/utils';
import { LoadingCards } from 'src/pages/Home';
import ChartCard from 'src/features/charts/ChartCard';
import Chart from 'src/types/Chart';
import handleResourceExport from 'src/utils/export';
import { Loading } from '@zobi.dev/core/components';
import { ErrorBoundary } from 'src/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { navigateTo } from 'src/utils/navigationUtils';
import EmptyState from './EmptyState';
import { WelcomeTable } from './types';
import SubMenu from './SubMenu';

interface ChartTableProps {
  addDangerToast: (message: string) => void;
  addSuccessToast: (message: string) => void;
  user?: User;
  mine: Array<any>;
  showThumbnails: boolean;
  otherTabData?: Array<object>;
  otherTabFilters: Filter[];
  otherTabTitle: string;
}

function ChartTable({
  user,
  addDangerToast,
  addSuccessToast,
  mine,
  showThumbnails,
  otherTabData,
  otherTabFilters,
  otherTabTitle,
}: ChartTableProps) {
  const history = useHistory();
  const initialTab = getItem(
    LocalStorageKeys.HomepageChartFilter,
    TableTab.Other,
  );

  const filteredOtherTabData = otherTabData?.filter(obj => 'viz_type' in obj);

  const {
    state: { loading, resourceCollection: charts, bulkSelectEnabled },
    setResourceCollection: setCharts,
    hasPerm,
    refreshData,
    fetchData,
  } = useListViewResource<Chart>(
    'chart',
    t('chart'),
    addDangerToast,
    true,
    initialTab === TableTab.Mine ? mine : filteredOtherTabData,
    [],
    false,
  );

  const chartIds = useMemo(() => charts.map(c => c.id), [charts]);
  const [saveFavoriteStatus, favoriteStatus] = useFavoriteStatus(
    'chart',
    chartIds,
    addDangerToast,
  );
  const {
    sliceCurrentlyEditing,
    openChartEditModal,
    handleChartUpdated,
    closeChartEditModal,
  } = useChartEditModal(setCharts, charts);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [preparingExport, setPreparingExport] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const getChartFetchDataConfig = (tab: TableTab) => ({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
    sortBy: [
      {
        id: 'changed_on_delta_humanized',
        desc: true,
      },
    ],
    filters: getFilterValues(tab, WelcomeTable.Charts, user, otherTabFilters),
  });

  const getData = (tab: TableTab) => fetchData(getChartFetchDataConfig(tab));

  useEffect(() => {
    if (loaded || activeTab === TableTab.Favorite) {
      getData(activeTab);
    }
    setLoaded(true);
  }, [activeTab]);

  const handleBulkChartExport = async (chartsToExport: Chart[]) => {
    const ids = chartsToExport.map(({ id }) => id);
    setPreparingExport(true);
    try {
      await handleResourceExport('chart', ids, () => {
        setPreparingExport(false);
      });
    } catch (error) {
      setPreparingExport(false);
      addDangerToast(t('There was an issue exporting the selected charts'));
    }
  };

  const menuTabs = [
    {
      name: TableTab.Favorite,
      label: t('Favorite'),
      onClick: () => {
        setActiveTab(TableTab.Favorite);
        setItem(LocalStorageKeys.HomepageChartFilter, TableTab.Favorite);
      },
    },
    {
      name: TableTab.Mine,
      label: t('Mine'),
      onClick: () => {
        setActiveTab(TableTab.Mine);
        setItem(LocalStorageKeys.HomepageChartFilter, TableTab.Mine);
      },
    },
  ];
  if (otherTabData) {
    menuTabs.push({
      name: TableTab.Other,
      label: otherTabTitle,
      onClick: () => {
        setActiveTab(TableTab.Other);
        setItem(LocalStorageKeys.HomepageChartFilter, TableTab.Other);
      },
    });
  }

  if (loading) return <LoadingCards cover={showThumbnails} />;
  return (
    <ErrorBoundary>
      {sliceCurrentlyEditing && (
        <PropertiesModal
          onHide={closeChartEditModal}
          onSave={handleChartUpdated}
          show
          slice={sliceCurrentlyEditing}
        />
      )}

      <SubMenu
        activeChild={activeTab}
        tabs={menuTabs}
        backgroundColor="transparent"
        buttons={[
          {
            icon: (
              <Icons.PlusOutlined
                iconSize="m"
                data-test="add-annotation-layer-button"
              />
            ),
            name: t('Chart'),
            buttonStyle: 'secondary',
            onClick: () => {
              navigateTo('/chart/add', { assign: true });
            },
          },
          {
            name: t('View All »'),
            buttonStyle: 'link',
            onClick: () => {
              const target =
                activeTab === TableTab.Favorite
                  ? `/chart/list/?filters=(favorite:(label:${t(
                      'Yes',
                    )},value:!t))`
                  : '/chart/list/';
              history.push(target);
            },
          },
        ]}
      />
      {charts?.length ? (
        <CardContainer showThumbnails={showThumbnails}>
          {charts.map(e => (
            <ChartCard
              key={`${e.id}`}
              openChartEditModal={openChartEditModal}
              chartFilter={activeTab}
              chart={e}
              userId={user?.userId}
              hasPerm={hasPerm}
              showThumbnails={showThumbnails}
              bulkSelectEnabled={bulkSelectEnabled}
              refreshData={refreshData}
              addDangerToast={addDangerToast}
              addSuccessToast={addSuccessToast}
              getData={getData}
              favoriteStatus={favoriteStatus[e.id]}
              saveFavoriteStatus={saveFavoriteStatus}
              handleBulkChartExport={handleBulkChartExport}
            />
          ))}
        </CardContainer>
      ) : (
        <EmptyState
          tableName={WelcomeTable.Charts}
          tab={activeTab}
          otherTabTitle={otherTabTitle}
        />
      )}
      {preparingExport && <Loading />}
    </ErrorBoundary>
  );
}

export default withToasts(ChartTable);
