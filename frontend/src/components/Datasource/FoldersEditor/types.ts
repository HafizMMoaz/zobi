import { Metric, ColumnMeta } from '@zobi-ui/chart-controls';
import { DatasourceFolder } from 'src/explore/components/DatasourcePanel/types';

export interface FoldersEditorProps {
  folders: DatasourceFolder[];
  metrics: Metric[];
  columns: ColumnMeta[];
  onChange: (folders: DatasourceFolder[]) => void;
}
