import { useMemo } from 'react';
import { MenuItem } from '@zobi.dev/core/components/Menu';
import { t } from '@zobi.dev/extension-api/translation';
import { styled } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Typography } from '@zobi.dev/core/components/Typography';

export interface Languages {
  [key: string]: {
    flag?: string;
    url?: string;
    name?: string;
  };
}

interface LanguagePickerProps {
  locale: string;
  languages: Languages;
}

const StyledLabel = styled.div`
  display: flex;
  align-items: center;

  & i {
    margin-right: ${({ theme }) => theme.sizeUnit * 2}px;
  }

  & a {
    display: block;
    width: 150px;
    word-wrap: break-word;
    text-decoration: none;
  }
`;

export const useLanguageMenuItems = ({
  locale,
  languages,
}: LanguagePickerProps): MenuItem =>
  useMemo(() => {
    const items: MenuItem[] = Object.keys(languages).map(langKey => ({
      key: langKey,
      label: (
        <StyledLabel className="f16">
          <i className={`flag ${languages[langKey]?.flag ?? 'us'}`} />
          <Typography.Link href={languages[langKey]?.url}>
            {languages[langKey]?.name}
          </Typography.Link>
        </StyledLabel>
      ),
      style: { whiteSpace: 'normal', height: 'auto' },
    }));

    return {
      key: 'language-submenu',
      type: 'submenu' as const,
      label: (
        <span className="f16" aria-label={t('Languages')}>
          <i className={`flag ${languages[locale]?.flag ?? 'us'}`} />
        </span>
      ),
      icon: <Icons.CaretDownOutlined iconSize="xs" />,
      children: items,
      className: 'submenu-with-caret',
      popupClassName: 'language-picker-popup',
    };
  }, [languages, locale]);
