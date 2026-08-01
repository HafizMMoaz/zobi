import { useMemo } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { MenuItem } from '@zobi.dev/core/components/Menu';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Link } from 'react-router-dom';

export interface DashboardsMenuProps {
  chartId?: number;
  dashboards?: { id: number; dashboard_title: string }[];
  searchTerm?: string;
}

export const useDashboardsMenuItems = ({
  chartId,
  dashboards = [],
  searchTerm = '',
}: DashboardsMenuProps): MenuItem[] => {
  const theme = useTheme();

  const filteredDashboards = useMemo(() => {
    if (!searchTerm) return dashboards;
    return dashboards.filter(dashboard =>
      dashboard.dashboard_title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [dashboards, searchTerm]);

  const urlQueryString = chartId ? `?focused_chart=${chartId}` : '';
  const noResults = dashboards.length === 0;
  const noResultsFound = searchTerm && filteredDashboards.length === 0;

  return useMemo(() => {
    const items: MenuItem[] = [];

    if (noResults) {
      items.push({
        key: 'no-dashboards',
        label: t('None'),
        disabled: true,
      });
    } else if (noResultsFound) {
      items.push({
        key: 'no-results',
        label: t('No results found'),
        disabled: true,
      });
    } else {
      filteredDashboards.forEach(dashboard => {
        items.push({
          key: String(dashboard.id),
          label: (
            <Link
              target="_blank"
              rel="noreferer noopener"
              to={`/zobi/dashboard/${dashboard.id}${urlQueryString}`}
              css={css`
                display: flex;
                flex-direction: row;
                align-items: center;
                width: 200px;
                justify-self: center;
              `}
            >
              <div
                css={css`
                  white-space: normal;
                  flex: 1;
                `}
              >
                {dashboard.dashboard_title}
              </div>
              <Icons.Full
                iconSize="l"
                css={{ marginLeft: theme.sizeUnit * 2 }}
              />
            </Link>
          ),
        });
      });
    }

    return items;
  }, [
    filteredDashboards,
    urlQueryString,
    noResults,
    noResultsFound,
    theme.sizeUnit,
  ]);
};
