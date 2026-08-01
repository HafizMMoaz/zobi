import { useMemo } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { Dataset } from 'src/components/Chart/types';
import MetadataBar from '@zobi.dev/core/components/MetadataBar';
import {
  ContentType,
  MetadataType,
} from '@zobi.dev/core/components/MetadataBar/ContentType';
import { isEmbedded } from 'src/dashboard/util/isEmbedded';

export interface UseDatasetMetadataBarProps {
  dataset?: Dataset;
}

export const useDatasetMetadataBar = ({
  dataset,
}: UseDatasetMetadataBarProps): { metadataBar: React.ReactElement | null } => {
  const theme = useTheme();

  const metadataBar = useMemo(() => {
    // Short-circuit for embedded users - they don't need metadata bar
    if (isEmbedded()) {
      return null;
    }
    const items: ContentType[] = [];
    if (dataset) {
      const {
        changed_on_humanized,
        created_on_humanized,
        description,
        table_name,
        changed_by,
        created_by,
        owners,
      } = dataset;
      const notAvailable = t('Not available');
      const createdBy =
        `${created_by?.first_name ?? ''} ${
          created_by?.last_name ?? ''
        }`.trim() || notAvailable;
      const modifiedBy = changed_by
        ? `${changed_by.first_name} ${changed_by.last_name}`
        : notAvailable;
      const formattedOwners =
        owners && owners.length > 0
          ? owners.map(owner => `${owner.first_name} ${owner.last_name}`)
          : [notAvailable];
      items.push({
        type: MetadataType.Table,
        title: table_name || notAvailable,
      });
      items.push({
        type: MetadataType.LastModified,
        value: changed_on_humanized || notAvailable,
        modifiedBy,
      });
      items.push({
        type: MetadataType.Owner,
        createdBy,
        owners: formattedOwners,
        createdOn: created_on_humanized || notAvailable,
      });
      if (description) {
        items.push({
          type: MetadataType.Description,
          value: description,
        });
      }
    }
    return (
      <div
        css={css`
          display: flex;
          margin-bottom: ${theme.sizeUnit * 4}px;
        `}
      >
        {items.length > 0 && (
          <MetadataBar items={items} tooltipPlacement="bottom" />
        )}
      </div>
    );
  }, [dataset, theme.sizeUnit]);

  return {
    metadataBar,
  };
};
