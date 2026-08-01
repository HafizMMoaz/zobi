import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/views/store';
import { t } from '@zobi/core/translation';
import { VizType } from '@zobi-ui/core';
import {
  createCtasDatasource,
  addInfoToast,
  addDangerToast,
} from 'src/SqlLab/actions/sqlLab';
import { Button, IconTooltip } from '@zobi-ui/core/components';
import { Icons } from '@zobi-ui/core/components/Icons';
import { exploreChart } from 'src/explore/exploreUtils';
import { SqlLabRootState } from 'src/SqlLab/types';

export interface ExploreCtasResultsButtonProps {
  table: string;
  schema?: string | null;
  dbId: number;
  templateParams?: string;
}

const ExploreCtasResultsButton = ({
  table,
  schema,
  dbId,
  templateParams,
}: ExploreCtasResultsButtonProps) => {
  const errorMessage = useSelector(
    (state: SqlLabRootState) => state.sqlLab.errorMessage,
  );
  const dispatch = useAppDispatch();

  const buildVizOptions = {
    table_name: table,
    schema,
    database_id: dbId,
    template_params: templateParams,
  };

  const visualize = () => {
    dispatch(createCtasDatasource(buildVizOptions))
      .then(data => {
        const formData = {
          datasource: `${data.table_id}__table`,
          metrics: ['count'],
          groupby: [],
          viz_type: VizType.Table,
          since: '100 years ago',
          all_columns: [],
          row_limit: 1000,
        };
        dispatch(
          addInfoToast(t('Creating a data source and creating a new tab')),
        );
        // open new window for data visualization
        exploreChart(formData);
      })
      .catch(() => {
        dispatch(addDangerToast(errorMessage || t('An error occurred')));
      });
  };

  return (
    <Button
      buttonSize="small"
      onClick={visualize}
      tooltip={t('Explore the result set in the data exploration view')}
    >
      <IconTooltip placement="top" tooltip={t('Explore')} />
      <Icons.LineChartOutlined iconSize="m" />
      {t('Explore')}
    </Button>
  );
};

export default ExploreCtasResultsButton;
