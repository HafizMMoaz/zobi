import { extendedDayjs } from '@zobi-ui/core/utils/dates';
import { t } from '@zobi/core/translation';
import { styled } from '@zobi/core/theme';
import {
  TableView,
  EmptyWrapperType,
} from '@zobi-ui/core/components/TableView';
import { EmptyState } from '@zobi-ui/core/components';
import { FacePile, TagsList, type TagType } from 'src/components';
import { TaggedObject, TaggedObjects } from 'src/types/TaggedObject';
import { Typography } from '@zobi-ui/core/components/Typography';

const MAX_TAGS_TO_SHOW = 3;
const PAGE_SIZE = 10;

const AllEntitiesTableContainer = styled.div`
  text-align: left;
  border-radius: ${({ theme }) => theme.borderRadius}px 0;
  .table {
    table-layout: fixed;
  }
  .td {
    width: 33%;
  }
  .entity-title {
    font-family: Inter;
    font-size: ${({ theme }) => theme.fontSize}px;
    font-weight: ${({ theme }) => theme.fontWeightStrong};
    line-height: 17px;
    letter-spacing: 0px;
    text-align: left;
    margin: ${({ theme }) => theme.sizeUnit * 4}px 0;
  }
`;

interface AllEntitiesTableProps {
  search?: string;
  setShowTagModal: (show: boolean) => void;
  objects: TaggedObjects;
  canEditTag: boolean;
}

export default function AllEntitiesTable({
  search = '',
  setShowTagModal,
  objects,
  canEditTag,
}: AllEntitiesTableProps) {
  type objectType = 'dashboard' | 'chart' | 'query';

  const showDashboardList = objects.dashboard.length > 0;
  const showChartList = objects.chart.length > 0;
  const showQueryList = objects.query.length > 0;
  const showListViewObjs = showDashboardList || showChartList || showQueryList;

  const renderTable = (type: objectType) => {
    const data = objects[type].map((o: TaggedObject) => ({
      [type]: <Typography.Link href={o.url}>{o.name}</Typography.Link>,
      modified: o.changed_on ? extendedDayjs.utc(o.changed_on).fromNow() : '',
      tags: o.tags,
      owners: o.owners,
    }));

    return (
      <TableView
        className="table-condensed"
        emptyWrapperType={EmptyWrapperType.Small}
        data={data}
        pageSize={PAGE_SIZE}
        columns={[
          {
            accessor: type,
            Header: 'Title',
            id: type,
          },
          {
            Cell: ({
              row: {
                original: { tags = [] },
              },
            }: {
              row: {
                original: {
                  tags: TagType[];
                };
              };
            }) => (
              // Only show custom type tags
              <TagsList
                tags={tags.filter(
                  (tag: TagType) =>
                    tag.type !== undefined &&
                    ['TagType.custom', 1].includes(tag.type),
                )}
                maxTags={MAX_TAGS_TO_SHOW}
              />
            ),
            Header: t('Tags'),
            accessor: 'tags',
            disableSortBy: true,
            id: 'tags',
          },
          {
            Cell: ({
              row: {
                original: { owners = [] },
              },
            }: any) => <FacePile users={owners} />,
            Header: t('Owners'),
            accessor: 'owners',
            disableSortBy: true,
            size: 'xl',
            id: 'owners',
          },
        ]}
      />
    );
  };

  return (
    <AllEntitiesTableContainer>
      {showListViewObjs ? (
        <>
          {showDashboardList && (
            <>
              <div className="entity-title">{t('Dashboards')}</div>
              {renderTable('dashboard')}
            </>
          )}
          {showChartList && (
            <>
              <div className="entity-title">{t('Charts')}</div>
              {renderTable('chart')}
            </>
          )}
          {showQueryList && (
            <>
              <div className="entity-title">{t('Queries')}</div>
              {renderTable('query')}
            </>
          )}
        </>
      ) : (
        <EmptyState
          image="dashboard.svg"
          size="large"
          title={t('No entities have this tag currently assigned')}
          {...(canEditTag && {
            buttonAction: () => setShowTagModal(true),
            buttonText: t('Add tag to entities'),
          })}
        />
      )}
    </AllEntitiesTableContainer>
  );
}
