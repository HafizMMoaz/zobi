import { useMemo } from 'react';
import { t } from '@zobi/core/translation';
import { tn } from '@zobi/core/translation';
import MetadataBar, {
  MetadataType,
} from '@zobi-ui/core/components/MetadataBar';
import { ExplorePageInitialData } from 'src/explore/types';

export const useExploreMetadataBar = (
  metadata: ExplorePageInitialData['metadata'],
  slice: ExplorePageInitialData['slice'],
) =>
  useMemo(() => {
    if (!metadata) {
      return null;
    }
    const items = [];
    if (metadata.dashboards) {
      items.push({
        type: MetadataType.Dashboards as const,
        title:
          metadata.dashboards.length > 0
            ? tn(
                'Added to 1 dashboard',
                'Added to %s dashboards',
                metadata.dashboards.length,
                metadata.dashboards.length,
              )
            : t('Not added to any dashboard'),
        description:
          metadata.dashboards.length > 0
            ? t(
                'You can preview the list of dashboards in the chart settings dropdown.',
              )
            : undefined,
      });
    }
    items.push({
      type: MetadataType.LastModified as const,
      value: metadata.changed_on_humanized,
      modifiedBy: metadata.changed_by || t('Not available'),
    });
    items.push({
      type: MetadataType.Owner as const,
      createdBy: metadata.created_by || t('Not available'),
      owners: metadata.owners.length > 0 ? metadata.owners : t('None'),
      createdOn: metadata.created_on_humanized,
    });
    if (slice?.description) {
      items.push({
        type: MetadataType.Description as const,
        value: slice?.description,
      });
    }
    return <MetadataBar items={items} tooltipPlacement="bottom" />;
  }, [metadata, slice?.description]);
