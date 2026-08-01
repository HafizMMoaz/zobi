import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { t } from '@zobi.dev/extension-api/translation';
import {
  FeatureFlag,
  isFeatureEnabled,
  getExtensionsRegistry,
  usePrevious,
} from '@zobi.dev/core';
import { styled, css } from '@zobi.dev/extension-api/theme';
import { MenuItem } from '@zobi.dev/core/components/Menu';
import { Checkbox } from '@zobi.dev/core/components';
import { noOp } from 'src/utils/common';
import { ChartState } from 'src/explore/types';
import { UserWithPermissionsAndRoles } from 'src/types/bootstrapTypes';
import {
  fetchUISpecificReport,
  toggleActive,
} from 'src/features/reports/ReportModal/actions';
import { ReportObject } from 'src/features/reports/types';
import { MenuItemWithCheckboxContainer } from 'src/explore/components/useExploreAdditionalActionsMenu/index';

const extensionsRegistry = getExtensionsRegistry();

export enum CreationMethod {
  Charts = 'charts',
  Dashboards = 'dashboards',
}

const StyledDropdownItemWithIcon = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  > *:first-of-type {
    margin-right: ${({ theme }) => theme.sizeUnit}px;
  }
`;

const DropdownItemExtension = extensionsRegistry.get(
  'report-modal.dropdown.item.icon',
);

export interface HeaderReportProps {
  dashboardId?: number;
  chart?: ChartState;
  showReportModal: () => void;
  setCurrentReportDeleting: (report: ReportObject | null) => void;
}

export const useHeaderReportMenuItems = ({
  dashboardId,
  chart,
  showReportModal,
  setCurrentReportDeleting,
}: HeaderReportProps): MenuItem | null => {
  const dispatch = useDispatch();
  const resourceId = dashboardId || chart?.id;
  const resourceType = dashboardId
    ? CreationMethod.Dashboards
    : CreationMethod.Charts;

  // Select the reports state and specific report with proper reactivity
  const report = useSelector<any, ReportObject | null>(state => {
    if (!resourceId) return null;
    // Select directly from the reports state to ensure reactivity
    const reportsState = state.reports || {};
    const resourceTypeReports = reportsState[resourceType] || {};
    const reportData = resourceTypeReports[resourceId];
    return reportData || null;
  });

  const user: UserWithPermissionsAndRoles = useSelector<
    any,
    UserWithPermissionsAndRoles
  >(state => state.user);

  const prevDashboard = usePrevious(dashboardId);

  // Check if user can add reports
  const canAddReports = () => {
    if (!isFeatureEnabled(FeatureFlag.AlertReports)) return false;
    if (!user?.userId) return false;
    if (!resourceId) return false;

    const roles = Object.keys(user.roles || []);
    const permissions = roles.map(key =>
      user.roles[key].filter(
        perms => perms[0] === 'menu_access' && perms[1] === 'Manage',
      ),
    );
    return permissions.some(permission => permission.length > 0);
  };

  const shouldFetch =
    canAddReports() &&
    !!((dashboardId && prevDashboard !== dashboardId) || chart?.id);

  // Fetch report data when needed
  useEffect(() => {
    if (shouldFetch && resourceId) {
      dispatch(
        fetchUISpecificReport({
          userId: user.userId,
          filterField: dashboardId ? 'dashboard_id' : 'chart_id',
          creationMethod: dashboardId ? 'dashboards' : 'charts',
          resourceId,
        }),
      );
    }
  }, [dispatch, shouldFetch, user?.userId, dashboardId, resourceId]);

  // Don't show anything if user can't add reports
  if (!canAddReports()) {
    return null;
  }

  // Handler functions
  const handleShowModal = () => showReportModal();
  const handleDeleteReport = () => setCurrentReportDeleting(report);
  const handleToggleActive = () => {
    if (report?.id && report.active !== undefined) {
      dispatch(toggleActive(report as unknown as ReportObject, !report.active));
    }
  };

  // If no report exists, show "Set up email report" option
  if (!report || !report.id) {
    return {
      key: 'email-report-setup',
      type: 'submenu' as const,
      label: t('Manage email report'),
      children: [
        {
          key: 'set-up-report',
          label: DropdownItemExtension ? (
            <StyledDropdownItemWithIcon>
              <div>{t('Set up an email report')}</div>
              <DropdownItemExtension />
            </StyledDropdownItemWithIcon>
          ) : (
            t('Set up an email report')
          ),
          onClick: handleShowModal,
        },
      ],
    };
  }

  // If report exists, show management options
  return {
    key: 'email-report-manage',
    type: 'submenu' as const,
    label: t('Manage email report'),
    children: [
      {
        key: 'toggle-active',
        label: (
          <MenuItemWithCheckboxContainer>
            <Checkbox
              checked={report.active || false}
              onChange={noOp}
              css={theme => css`
                margin-right: ${theme.sizeUnit}px;
              `}
            />
            {t('Email reports active')}
          </MenuItemWithCheckboxContainer>
        ),
        onClick: handleToggleActive,
      },
      {
        key: 'edit-report',
        label: t('Edit email report'),
        onClick: handleShowModal,
      },
      {
        key: 'delete-report',
        label: t('Delete email report'),
        onClick: handleDeleteReport,
        danger: true,
      },
    ],
  };
};
