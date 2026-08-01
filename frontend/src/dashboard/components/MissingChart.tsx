import { t } from '@zobi.dev/extension-api/translation';

interface MissingChartProps {
  height: number;
}

export default function MissingChart({ height }: MissingChartProps) {
  return (
    <div className="missing-chart-container" style={{ height: height + 20 }}>
      <div className="missing-chart-body">
        {t(
          'There is no chart definition associated with this component, could it have been deleted?',
        )}
        <br />
        <br />
        {t('Delete this container and save to remove this message.')}
      </div>
    </div>
  );
}
