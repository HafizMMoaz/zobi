import { memo, useMemo } from 'react';
import { useTruncation } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import { Link } from 'react-router-dom';
import CrossLinksTooltip from './CrossLinksTooltip';

export type CrossLinkProps = {
  title: string;
  id: number;
};

export type CrossLinksProps = {
  crossLinks: Array<CrossLinkProps>;
  maxLinks?: number;
  linkPrefix?: string;
  external?: boolean;
};

const StyledCrossLinks = styled.div`
  ${({ theme }) => `
    & > span {
      width: 100%;
      display: flex;

      .ant-tooltip-open {
        display: inline;
      }

      .truncated {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        width: 100%;
        vertical-align: bottom;
      }

      .count {
        cursor: pointer;
        color: ${theme.colorTextSecondary};
        font-weight: ${theme.fontWeightStrong};
      }
    }
  `}
`;

function CrossLinks({
  crossLinks,
  maxLinks = 20,
  linkPrefix = '/zobi/dashboard/',
  external = false,
}: CrossLinksProps) {
  const [crossLinksRef, plusRef, elementsTruncated, hasHiddenElements] =
    useTruncation();
  const hasMoreItems = useMemo(
    () =>
      crossLinks.length > maxLinks ? crossLinks.length - maxLinks : undefined,
    [crossLinks, maxLinks],
  );
  const links = useMemo(
    () => (
      <span className="truncated" ref={crossLinksRef} data-test="crosslinks">
        {crossLinks.map((link, index) => (
          <Link
            key={link.id}
            to={linkPrefix + link.id}
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {index === 0 ? link.title : `, ${link.title}`}
          </Link>
        ))}
      </span>
    ),
    [crossLinks, crossLinksRef, linkPrefix, external],
  );
  const tooltipLinks = useMemo(
    () =>
      crossLinks.slice(0, maxLinks).map(l => ({
        title: l.title,
        to: linkPrefix + l.id,
      })),
    [crossLinks, linkPrefix, maxLinks],
  );

  return (
    <StyledCrossLinks>
      <CrossLinksTooltip
        moreItems={hasMoreItems}
        crossLinks={tooltipLinks}
        show={!!elementsTruncated}
      >
        {links}
        {hasHiddenElements && (
          <span ref={plusRef} className="count" data-test="count-crosslinks">
            +{elementsTruncated}
          </span>
        )}
      </CrossLinksTooltip>
    </StyledCrossLinks>
  );
}

export default memo(CrossLinks);
