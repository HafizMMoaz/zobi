import { ReactNode } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { Link } from 'react-router-dom';
import { Tooltip } from '@zobi.dev/core/components';

export type CrossLinksTooltipProps = {
  children: ReactNode;
  crossLinks: { to: string; title: string }[];
  moreItems?: number;
  show: boolean;
};

const StyledLinkedTooltip = styled.div`
  .link {
    color: ${({ theme }) => theme.colorLink};
    display: block;
    text-decoration: underline;
  }
`;

export default function CrossLinksTooltip({
  children,
  crossLinks = [],
  moreItems = undefined,
  show = false,
}: CrossLinksTooltipProps) {
  return (
    <Tooltip
      placement="top"
      data-test="crosslinks-tooltip"
      title={
        show && (
          <StyledLinkedTooltip>
            {crossLinks.map(link => (
              <Link
                className="link"
                key={link.to}
                to={link.to}
                target="_blank"
                rel="noreferer noopener"
              >
                {link.title}
              </Link>
            ))}
            {moreItems && (
              <span data-test="plus-more">{t('+ %s more', moreItems)}</span>
            )}
          </StyledLinkedTooltip>
        )
      }
    >
      {children}
    </Tooltip>
  );
}
