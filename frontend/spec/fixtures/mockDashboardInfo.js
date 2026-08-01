import { FilterBarOrientation } from 'src/dashboard/types';

export default {
  id: 1234,
  slug: 'dashboardSlug',
  metadata: {
    native_filter_configuration: [
      {
        id: 'DefaultsID',
        filterType: 'filter_select',
        chartsInScope: [],
        targets: [{}],
        cascadeParentIds: [],
      },
    ],
  },
  changed_on_delta_humanized: '7 minutes ago',
  changed_by: {
    id: 3,
    first_name: 'John',
    last_name: 'Doe',
  },
  created_on_delta_humanized: '10 days ago',
  created_by: {
    id: 2,
    first_name: 'Kay',
    last_name: 'Mon',
  },
  owners: [{ first_name: 'John', last_name: 'Doe', id: 1 }],
  userId: 'mock_user_id',
  dash_edit_perm: true,
  dash_save_perm: true,
  common: {
    conf: { ZOBI_WEBSERVER_TIMEOUT: 60 },
  },
  filterBarOrientation: FilterBarOrientation.Vertical,
};
