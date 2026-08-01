import { isFeatureEnabled, FeatureFlag } from '@zobi.dev/core';
import { useSelector } from 'react-redux';
import { RootState } from 'src/dashboard/types';
import { findPermission } from 'src/utils/findPermission';

export const usePermissions = () => {
  const canExplore = useSelector((state: RootState) =>
    findPermission('can_explore', 'Zobi', state.user?.roles),
  );
  const canWriteExploreFormData = useSelector((state: RootState) =>
    findPermission('can_write', 'ExploreFormDataRestApi', state.user?.roles),
  );
  const canDatasourceSamples = useSelector((state: RootState) =>
    findPermission('can_samples', 'Datasource', state.user?.roles),
  );
  const canCsvLegacy = useSelector((state: RootState) =>
    findPermission('can_csv', 'Zobi', state.user?.roles),
  );
  const canExportCsvSqlLab = useSelector((state: RootState) =>
    findPermission('can_export_csv', 'SQLLab', state.user?.roles),
  );
  const canExportDataGranular = useSelector((state: RootState) =>
    findPermission('can_export_data', 'Zobi', state.user?.roles),
  );
  const canExportImageGranular = useSelector((state: RootState) =>
    findPermission('can_export_image', 'Zobi', state.user?.roles),
  );
  const canCopyClipboardGranular = useSelector((state: RootState) =>
    findPermission('can_copy_clipboard', 'Zobi', state.user?.roles),
  );
  const granularExport = isFeatureEnabled(FeatureFlag.GranularExportControls);
  const canExportData = granularExport ? canExportDataGranular : canCsvLegacy;
  const canExportImage = granularExport ? canExportImageGranular : canCsvLegacy;
  const canCopyClipboard = granularExport
    ? canCopyClipboardGranular
    : canCsvLegacy;
  const canDownload = canExportData;
  // SQL Lab uses a separate legacy permission (can_export_csv on SQLLab)
  const canExportDataSqlLab = granularExport
    ? canExportDataGranular
    : canExportCsvSqlLab;
  const canCopyClipboardSqlLab = granularExport
    ? canCopyClipboardGranular
    : canExportCsvSqlLab;
  const canDrill = useSelector((state: RootState) =>
    findPermission('can_drill', 'Dashboard', state.user?.roles),
  );
  const canGetDrillInfo = useSelector((state: RootState) =>
    findPermission('can_get_drill_info', 'Dataset', state.user?.roles),
  );
  const canDrillBy =
    (canExplore || canDrill) && canWriteExploreFormData && canGetDrillInfo;
  const canDrillToDetail =
    (canExplore || canDrill) && canDatasourceSamples && canGetDrillInfo;
  const canViewQuery = useSelector((state: RootState) =>
    findPermission('can_view_query', 'Dashboard', state.user?.roles),
  );
  const canViewTable = useSelector((state: RootState) =>
    findPermission('can_view_chart_as_table', 'Dashboard', state.user?.roles),
  );

  return {
    canExplore,
    canWriteExploreFormData,
    canDatasourceSamples,
    canDownload,
    canExportData,
    canExportDataSqlLab,
    canExportImage,
    canCopyClipboard,
    canCopyClipboardSqlLab,
    canDrill,
    canDrillBy,
    canDrillToDetail,
    canViewQuery,
    canViewTable,
  };
};
