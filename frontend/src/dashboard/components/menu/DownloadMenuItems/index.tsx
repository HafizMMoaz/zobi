import { SyntheticEvent } from 'react';
import { logging } from '@zobi.dev/extension-api/utils';
import { t } from '@zobi.dev/extension-api/translation';
import {
  FeatureFlag,
  isFeatureEnabled,
  ZobiClient,
} from '@zobi.dev/core';
import { MenuItem } from '@zobi.dev/core/components/Menu';
import { parse as parseContentDisposition } from 'content-disposition';
import { useDownloadScreenshot } from 'src/dashboard/hooks/useDownloadScreenshot';
import { MenuKeys } from 'src/dashboard/types';
import downloadAsPdf from 'src/utils/downloadAsPdf';
import downloadAsImage from 'src/utils/downloadAsImage';
import handleResourceExport from 'src/utils/export';
import {
  LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_PDF,
  LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_IMAGE,
} from 'src/logger/LogUtils';
import { useToasts } from 'src/components/MessageToasts/withToasts';

import { MenuItemTooltip } from 'src/components/Chart/DisabledMenuItemTooltip';
import { DownloadScreenshotFormat } from './types';

export interface UseDownloadMenuItemsProps {
  pdfMenuItemTitle: string;
  imageMenuItemTitle: string;
  dashboardTitle: string;
  logEvent?: Function;
  dashboardId: number;
  title: string;
  disabled?: boolean;
  userCanExport?: boolean;
  canExportImage?: boolean;
}

export const useDownloadMenuItems = (
  props: UseDownloadMenuItemsProps,
): MenuItem => {
  const {
    pdfMenuItemTitle,
    imageMenuItemTitle,
    logEvent,
    dashboardId,
    dashboardTitle,
    disabled,
    title,
    userCanExport,
    canExportImage,
  } = props;

  const { addDangerToast, addSuccessToast } = useToasts();
  const SCREENSHOT_NODE_SELECTOR = '.dashboard';

  const isWebDriverScreenshotEnabled =
    isFeatureEnabled(FeatureFlag.EnableDashboardScreenshotEndpoints) &&
    isFeatureEnabled(FeatureFlag.EnableDashboardDownloadWebDriverScreenshot);

  const downloadScreenshot = useDownloadScreenshot(dashboardId, logEvent);

  const onDownloadPdf = async (e: SyntheticEvent) => {
    try {
      downloadAsPdf(SCREENSHOT_NODE_SELECTOR, dashboardTitle, true)(e);
    } catch (error) {
      logging.error(error);
      addDangerToast(t('Sorry, something went wrong. Try again later.'));
    }
    logEvent?.(LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_PDF);
  };

  const onDownloadImage = async (e: SyntheticEvent) => {
    try {
      downloadAsImage(SCREENSHOT_NODE_SELECTOR, dashboardTitle, true)(e);
    } catch (error) {
      logging.error(error);
      addDangerToast(t('Sorry, something went wrong. Try again later.'));
    }
    logEvent?.(LOG_ACTIONS_DASHBOARD_DOWNLOAD_AS_IMAGE);
  };

  const onExportZip = async () => {
    try {
      await handleResourceExport('dashboard', [dashboardId], () => {});
      addSuccessToast(t('Dashboard exported successfully'));
    } catch (error) {
      logging.error(error);
      addDangerToast(t('Sorry, something went wrong. Try again later.'));
    }
  };

  const onExportAsExample = async () => {
    try {
      const response = await ZobiClient.get({
        endpoint: `/api/v1/dashboard/${dashboardId}/export_as_example/`,
        headers: {
          Accept: 'application/zip',
        },
        parseMethod: 'raw',
      });

      // Parse filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition');
      let fileName = `dashboard_${dashboardId}_example.zip`;

      if (disposition) {
        try {
          const parsed = parseContentDisposition(disposition);
          if (parsed?.parameters?.filename) {
            fileName = parsed.parameters.filename;
          }
        } catch (error) {
          logging.warn('Failed to parse Content-Disposition header:', error);
        }
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        window.URL.revokeObjectURL(url);
      }

      addSuccessToast(t('Dashboard exported as example successfully'));
    } catch (error) {
      logging.error(error);
      addDangerToast(t('Sorry, something went wrong. Try again later.'));
    }
  };

  const imageDisabled = canExportImage === false;

  const imageExportLabel = (text: string) =>
    imageDisabled ? (
      <span>
        {text}
        <MenuItemTooltip
          title={t("You don't have permission to export images")}
        />
      </span>
    ) : (
      text
    );

  const screenshotMenuItems: MenuItem[] = isWebDriverScreenshotEnabled
    ? [
        {
          key: DownloadScreenshotFormat.PDF,
          label: imageExportLabel(pdfMenuItemTitle),
          disabled: imageDisabled,
          onClick: () => downloadScreenshot(DownloadScreenshotFormat.PDF),
        },
        {
          key: DownloadScreenshotFormat.PNG,
          label: imageExportLabel(imageMenuItemTitle),
          disabled: imageDisabled,
          onClick: () => downloadScreenshot(DownloadScreenshotFormat.PNG),
        },
      ]
    : [
        {
          key: 'download-pdf',
          label: imageExportLabel(pdfMenuItemTitle),
          disabled: imageDisabled,
          onClick: (e: any) => onDownloadPdf(e.domEvent),
        },
        {
          key: 'download-image',
          label: imageExportLabel(imageMenuItemTitle),
          disabled: imageDisabled,
          onClick: (e: any) => onDownloadImage(e.domEvent),
        },
      ];

  const exportMenuItems: MenuItem[] = [
    {
      key: 'export-yaml',
      label: t('Export YAML'),
      onClick: onExportZip,
    },
    ...(userCanExport
      ? [
          {
            key: 'export-as-example',
            label: t('Export as Example'),
            onClick: onExportAsExample,
          },
        ]
      : []),
  ];

  const children: MenuItem[] = [
    ...screenshotMenuItems,
    { type: 'divider', key: 'export-divider' },
    ...exportMenuItems,
  ];

  return {
    key: MenuKeys.Download,
    type: 'submenu',
    label: title,
    disabled,
    children,
  };
};
