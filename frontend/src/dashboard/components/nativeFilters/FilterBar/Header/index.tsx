/* eslint-disable no-param-reassign */
import { t } from '@zobi/core/translation';
import { css, styled } from '@zobi/core/theme';
import { memo, FC } from 'react';
import { Icons } from '@zobi-ui/core/components/Icons';
import { Button } from '@zobi-ui/core/components';
import { getFilterBarTestId } from '../utils';
import FilterBarSettings from '../FilterBarSettings';

const TitleArea = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 0;
    padding: 0 ${theme.sizeUnit * 2}px ${theme.sizeUnit * 2}px;
    padding-bottom: 0; /* Works with other changes in PR https://github.com/HafizMMoaz/zobi/pull/38646 to reduces space between filter header and 1st filter */

    & > span {
      font-size: ${theme.fontSizeLG}px;
      flex-grow: 1;
      font-weight: ${theme.fontWeightStrong};
    }

    & > div:first-of-type {
      line-height: 0;
    }

    & > button > span.anticon {
      line-height: 0;
    }
  `}
`;

const HeaderButton = styled(Button)`
  padding: 0;
`;

const Wrapper = styled.div`
  ${({ theme }) => `
    padding: ${theme.sizeUnit * 3}px ${theme.sizeUnit * 2}px;
    padding-bottom: 0; /* Works with other changes in PR https://github.com/HafizMMoaz/zobi/pull/38646 to reduces space between filter header and 1st filter */
  `}
`;

type HeaderProps = {
  toggleFiltersBar: (arg0: boolean) => void;
};

const Header: FC<HeaderProps> = ({ toggleFiltersBar }) => (
  <Wrapper>
    <TitleArea>
      <span>{t('Filters and controls')}</span>
      <FilterBarSettings />
      <HeaderButton
        {...getFilterBarTestId('collapse-button')}
        buttonStyle="link"
        buttonSize="xsmall"
        onClick={() => toggleFiltersBar(false)}
      >
        <Icons.VerticalAlignTopOutlined
          iconSize="xl"
          css={css`
            transform: rotate(-90deg);
          `}
        />
      </HeaderButton>
    </TitleArea>
  </Wrapper>
);

export default memo(Header);
