import { styled, css } from '@zobi.dev/extension-api/theme';
import { Typography as AntdTypography } from 'antd';

export type { TitleProps } from 'antd/es/typography/Title';
export type { ParagraphProps } from 'antd/es/typography/Paragraph';

const StyledLink = styled(AntdTypography.Link)`
    ${({ theme }) =>
      css`
      && {
        color: ${theme.colorLink};
        &:hover {
          color: ${theme.colorLinkHover};
        }
    `}
  }
`;

export const Typography: typeof AntdTypography = Object.assign(AntdTypography, {
  Text: AntdTypography.Text,
  Link: StyledLink,
  Title: AntdTypography.Title,
  Paragraph: AntdTypography.Paragraph,
});
export type { TypographyProps } from 'antd';
