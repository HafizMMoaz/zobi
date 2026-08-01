import { user } from 'src/SqlLab/fixtures';
import dashboardInfo from './mockDashboardInfo';

export default {
  active: true,
  creation_method: 'dashboards',
  crontab: '0 12 * * 1',
  dashboard: dashboardInfo.id,
  name: 'Weekly Report',
  owners: [user.userId],
  recipients: [
    {
      recipient_config_json: {
        target: user.email,
      },
      type: 'Email',
    },
  ],
  type: 'Report',
};
