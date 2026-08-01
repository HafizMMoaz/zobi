import { useState } from 'react';
import { t } from '@zobi/core/translation';
import { getClientErrorObject } from '@zobi-ui/core';
import { useTheme } from '@zobi/core/theme';
import {
  Button,
  Icons,
  Popover,
  type PopoverProps,
} from '@zobi-ui/core/components';
import { CopyToClipboard } from 'src/components';
import { getDashboardPermalink } from 'src/utils/urlUtils';
import { useToasts } from 'src/components/MessageToasts/withToasts';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from 'src/dashboard/types';
import { Typography } from '@zobi-ui/core/components/Typography';
import { hasStatefulCharts } from 'src/dashboard/util/chartStateConverter';

export type URLShortLinkButtonProps = {
  dashboardId: number;
  anchorLinkId?: string;
  emailSubject?: string;
  emailContent?: string;
  placement?: PopoverProps['placement'];
};

export default function URLShortLinkButton({
  dashboardId,
  anchorLinkId,
  placement = 'right',
  emailContent = '',
  emailSubject = '',
}: URLShortLinkButtonProps) {
  const theme = useTheme();
  const [shortUrl, setShortUrl] = useState('');
  const { addDangerToast } = useToasts();
  const { dataMask, activeTabs, chartStates, sliceEntities } = useSelector(
    (state: RootState) => ({
      dataMask: state.dataMask,
      activeTabs: state.dashboardState.activeTabs,
      chartStates: state.dashboardState.chartStates,
      sliceEntities: state.sliceEntities?.slices,
    }),
    shallowEqual,
  );

  const getCopyUrl = async () => {
    try {
      // Check if dashboard has AG Grid tables (Table V2)
      const includeChartState =
        hasStatefulCharts(sliceEntities) &&
        chartStates &&
        Object.keys(chartStates).length > 0;

      const result = await getDashboardPermalink({
        dashboardId,
        dataMask,
        activeTabs,
        anchor: anchorLinkId,
        chartStates: includeChartState ? chartStates : undefined,
        includeChartState,
      });
      if (result?.url) {
        setShortUrl(result.url);
      }
    } catch (error) {
      if (error) {
        addDangerToast(
          (await getClientErrorObject(error)).error ||
            t('Something went wrong.'),
        );
      }
    }
  };

  const emailBody = `${emailContent}${shortUrl || ''}`;
  const emailLink = `mailto:?Subject=${emailSubject}%20&Body=${emailBody}`;

  return (
    <Popover
      trigger="click"
      placement={placement}
      content={
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          id="shorturl-popover"
          data-test="shorturl-popover"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <CopyToClipboard
            text={shortUrl}
            copyNode={
              <Icons.CopyOutlined iconSize="m" iconColor={theme.colorPrimary} />
            }
          />
          &nbsp;&nbsp;
          <Typography.Link href={emailLink} aria-label={t('Email link')}>
            <Icons.MailOutlined iconSize="m" iconColor={theme.colorPrimary} />
          </Typography.Link>
        </div>
      }
    >
      <Button
        tabIndex={-1}
        buttonStyle="link"
        icon={
          <Icons.LinkOutlined iconSize="m" className="short-link-trigger" />
        }
        onClick={e => {
          e.stopPropagation();
          getCopyUrl();
        }}
        aria-label={t('Copy URL')}
      />
    </Popover>
  );
}
