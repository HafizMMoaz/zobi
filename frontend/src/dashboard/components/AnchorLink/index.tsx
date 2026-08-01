import { useEffect } from 'react';
import { t } from '@zobi/core/translation';

import URLShortLinkButton, {
  URLShortLinkButtonProps,
} from 'src/dashboard/components/URLShortLinkButton';
import getLocationHash from 'src/dashboard/util/getLocationHash';

export type AnchorLinkProps = {
  id: string;
  dashboardId?: number;
  scrollIntoView?: boolean;
  showShortLinkButton?: boolean;
} & Pick<URLShortLinkButtonProps, 'placement'>;

export default function AnchorLink({
  id,
  dashboardId,
  placement = 'right',
  scrollIntoView = false,
  showShortLinkButton = true,
}: AnchorLinkProps) {
  const scrollAnchorIntoView = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  };

  // will always scroll element into view if element id and url hash match
  const hash = getLocationHash();
  useEffect(() => {
    if (hash && id === hash) {
      scrollAnchorIntoView(id);
    }
  }, [hash, id]);

  // force scroll into view
  useEffect(() => {
    if (scrollIntoView) {
      scrollAnchorIntoView(id);
    }
  }, [id, scrollIntoView]);

  return (
    <span className="anchor-link-container" id={id} data-test="anchor-link">
      {showShortLinkButton && dashboardId && (
        <URLShortLinkButton
          anchorLinkId={id}
          dashboardId={dashboardId}
          emailSubject={t('Zobi chart')}
          emailContent={t('Check out this chart in dashboard:')}
          placement={placement}
        />
      )}
    </span>
  );
}
