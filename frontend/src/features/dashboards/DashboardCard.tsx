import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { t } from '@zobi/core/translation';
import {
  isFeatureEnabled,
  FeatureFlag,
  ZobiClient,
} from '@zobi-ui/core';
import { CardStyles } from 'src/views/CRUD/utils';
import {
  Dropdown,
  Button,
  FaveStar,
  PublishedLabel,
  ListViewCard,
} from '@zobi-ui/core/components';
import { MenuItem } from '@zobi-ui/core/components/Menu';
import { Icons } from '@zobi-ui/core/components/Icons';
import { Dashboard } from 'src/views/CRUD/types';
import { assetUrl } from 'src/utils/assetUrl';
import { FacePile } from 'src/components';

interface DashboardCardProps {
  isChart?: boolean;
  dashboard: Dashboard;
  hasPerm: (name: string) => boolean;
  bulkSelectEnabled: boolean;
  loading: boolean;
  openDashboardEditModal?: (d: Dashboard) => void;
  saveFavoriteStatus: (id: number, isStarred: boolean) => void;
  favoriteStatus: boolean;
  userId?: string | number;
  showThumbnails?: boolean;
  handleBulkDashboardExport: (dashboardsToExport: Dashboard[]) => void;
  onDelete: (dashboard: Dashboard) => void;
}

function DashboardCard({
  dashboard,
  hasPerm,
  bulkSelectEnabled,
  userId,
  openDashboardEditModal,
  favoriteStatus,
  saveFavoriteStatus,
  showThumbnails,
  handleBulkDashboardExport,
  onDelete,
}: DashboardCardProps) {
  const history = useHistory();
  const canEdit = hasPerm('can_write');
  const canDelete = hasPerm('can_write');
  const canExport = hasPerm('can_export');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fetchingThumbnail, setFetchingThumbnail] = useState<boolean>(false);

  useEffect(() => {
    // fetch thumbnail only if it's not already fetched
    if (
      !fetchingThumbnail &&
      dashboard.id &&
      (thumbnailUrl === undefined || thumbnailUrl === null) &&
      isFeatureEnabled(FeatureFlag.Thumbnails)
    ) {
      // fetch thumbnail
      if (dashboard.thumbnail_url) {
        // set to empty string if null so that we don't
        // keep fetching the thumbnail
        setThumbnailUrl(dashboard.thumbnail_url || '');
        return;
      }
      setFetchingThumbnail(true);
      ZobiClient.get({
        endpoint: `/api/v1/dashboard/${dashboard.id}`,
      }).then(({ json = {} }) => {
        setThumbnailUrl(json.result?.thumbnail_url || '');
        setFetchingThumbnail(false);
      });
    }
  }, [dashboard, thumbnailUrl]);

  const menuItems: MenuItem[] = [];

  if (canEdit && openDashboardEditModal) {
    menuItems.push({
      key: 'edit',
      label: (
        <div
          role="button"
          tabIndex={0}
          className="action-button"
          onClick={() => openDashboardEditModal(dashboard)}
          data-test="dashboard-card-option-edit-button"
        >
          <Icons.EditOutlined iconSize="l" data-test="edit-alt" /> {t('Edit')}
        </div>
      ),
    });
  }

  if (canExport) {
    menuItems.push({
      key: 'export',
      label: (
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleBulkDashboardExport([dashboard])}
          className="action-button"
          data-test="dashboard-card-option-export-button"
        >
          <Icons.UploadOutlined iconSize="l" /> {t('Export')}
        </div>
      ),
    });
  }

  if (canDelete) {
    menuItems.push({
      key: 'delete',
      label: (
        <div
          role="button"
          tabIndex={0}
          className="action-button"
          onClick={() => onDelete(dashboard)}
          data-test="dashboard-card-option-delete-button"
        >
          <Icons.DeleteOutlined iconSize="l" /> {t('Delete')}
        </div>
      ),
    });
  }

  return (
    <CardStyles
      onClick={() => {
        if (!bulkSelectEnabled) {
          history.push(dashboard.url);
        }
      }}
    >
      <ListViewCard
        loading={dashboard.loading || false}
        title={dashboard.dashboard_title}
        certifiedBy={dashboard.certified_by}
        certificationDetails={dashboard.certification_details}
        titleRight={<PublishedLabel isPublished={dashboard.published} />}
        cover={
          !isFeatureEnabled(FeatureFlag.Thumbnails) || !showThumbnails ? (
            <></>
          ) : null
        }
        url={bulkSelectEnabled ? undefined : dashboard.url}
        linkComponent={Link}
        imgURL={thumbnailUrl}
        imgFallbackURL={assetUrl(
          '/static/assets/images/dashboard-card-fallback.svg',
        )}
        description={t('Modified %s', dashboard.changed_on_delta_humanized)}
        coverLeft={<FacePile users={dashboard.owners || []} />}
        actions={
          <ListViewCard.Actions
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {userId && (
              <FaveStar
                itemId={dashboard.id}
                saveFaveStar={saveFavoriteStatus}
                isStarred={favoriteStatus}
              />
            )}
            <Dropdown menu={{ items: menuItems }} trigger={['hover', 'click']}>
              <Button buttonSize="xsmall" buttonStyle="link">
                <Icons.MoreOutlined iconSize="xl" />
              </Button>
            </Dropdown>
          </ListViewCard.Actions>
        }
      />
    </CardStyles>
  );
}

export default DashboardCard;
