import { t } from '@zobi/core/translation';
import {
  Button,
  type OnClickHandler,
  Icons,
} from '@zobi-ui/core/components';

export interface ExploreResultsButtonProps {
  database?: {
    allows_subquery?: boolean;
  };
  onClick: OnClickHandler;
}

const ExploreResultsButton = ({
  database,
  onClick,
}: ExploreResultsButtonProps) => {
  const allowsSubquery = database?.allows_subquery ?? false;
  return (
    <Button
      buttonSize="small"
      variant="text"
      color="primary"
      icon={<Icons.LineChartOutlined iconSize="m" />}
      onClick={onClick}
      disabled={!allowsSubquery}
      role="button"
      tooltip={t('Create chart')}
      aria-label={t('Create chart')}
      data-test="explore-results-button"
    />
  );
};

export default ExploreResultsButton;
