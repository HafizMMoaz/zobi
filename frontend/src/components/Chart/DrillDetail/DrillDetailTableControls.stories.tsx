import TableControls, { TableControlsProps } from './DrillDetailTableControls';

export default {
  title: 'Components/Chart/DrillDetail/DrillDetailTableControls',
  component: TableControls,
};

export const InteractiveTableControls = (args: TableControlsProps) => (
  <TableControls {...args} />
);

InteractiveTableControls.args = {
  totalCount: 100,
  filters: [
    { op: '>', col: 'tz_offset', val: 200 },
    { op: '==', col: 'platform', val: 'GB' },
  ],
  canDownload: true,
  onDownloadCSV: () => {},
  onDownloadXLSX: () => {},
  onReload: () => {},
  loading: false,
};
