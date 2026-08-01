
import { useCallback, useEffect, MouseEvent } from 'react';

import { t } from '@zobi/core-legacy/translation';
import { css, styled, useTheme } from '@zobi/core-legacy/theme';
import { Icons } from '@zobi-ui/core/components/Icons';
import { Tooltip } from '../Tooltip';
import type { FaveStarProps } from './types';

const StyledLink = styled.a`
  ${({ theme }) => css`
    font-size: ${theme.fontSizeXL}px;
    display: flex;
    padding: 0 0 0 ${theme.sizeUnit * 2}px;
  `};
`;

export const FaveStar = ({
  itemId,
  isStarred,
  showTooltip,
  saveFaveStar,
  fetchFaveStar,
}: FaveStarProps) => {
  const theme = useTheme();
  useEffect(() => {
    fetchFaveStar?.(itemId);
  }, [fetchFaveStar, itemId]);

  const onClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      saveFaveStar(itemId, !!isStarred);
    },
    [isStarred, itemId, saveFaveStar],
  );

  const content = (
    <StyledLink
      href="#"
      onClick={onClick}
      className="fave-unfave-icon"
      data-test="fave-unfave-icon"
      role="button"
    >
      {isStarred ? (
        <Icons.StarFilled
          aria-label="starred"
          iconSize="l"
          iconColor={theme.colorWarning}
          name="favorite-selected"
        />
      ) : (
        <Icons.StarOutlined
          aria-label="unstarred"
          iconSize="l"
          iconColor={theme.colorTextTertiary}
          name="favorite-unselected"
        />
      )}
    </StyledLink>
  );

  if (showTooltip) {
    return (
      <Tooltip
        id="fave-unfave-tooltip"
        title={t('Click to favorite/unfavorite')}
      >
        {content}
      </Tooltip>
    );
  }

  return content;
};

export type { FaveStarProps };
