
import { useCSSTextTruncation, truncationCSS } from '@zobi.dev/core';
import { css, useTheme } from '@zobi.dev/extension-api/theme';
import { Icons } from '@zobi.dev/core/components/Icons';
import { Tooltip } from '@zobi.dev/core/components';
import { FilterBarOrientation } from 'src/dashboard/types';
import { FilterDividerProps } from './types';

const VerticalDivider = ({ title, description }: FilterDividerProps) => (
  <div>
    <h3>{title}</h3>
    {description ? <p data-test="divider-description">{description}</p> : null}
  </div>
);

const HorizontalDivider = ({ title, description }: FilterDividerProps) => {
  const theme = useTheme();
  const [titleRef, titleIsTruncated] =
    useCSSTextTruncation<HTMLHeadingElement>();

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        height: ${6 * theme.sizeUnit}px;
        border-left: 1px solid ${theme.colorSplit};
        padding-left: ${4 * theme.sizeUnit}px;

        .filter-item-wrapper:first-of-type & {
          border-left: none;
          padding-left: 0;
        }
      `}
    >
      <Tooltip overlay={titleIsTruncated ? title : null}>
        <h3
          ref={titleRef}
          css={css`
            ${truncationCSS};
            max-width: ${theme.sizeUnit * 32.5}px;
            font-size: ${theme.fontSize}px;
            font-weight: ${theme.fontWeightNormal};
            margin: 0;
            color: ${theme.colorText};
          `}
        >
          {title}
        </h3>
      </Tooltip>
      {description ? (
        <Tooltip overlay={description}>
          <Icons.BookOutlined
            data-test="divider-description-icon"
            iconSize="l"
            css={css`
              margin: 0 ${theme.sizeUnit * 1.5}px;
              vertical-align: unset;
              line-height: unset;
            `}
          />
        </Tooltip>
      ) : null}
    </div>
  );
};

const HorizontalOverflowDivider = ({
  title,
  description,
}: FilterDividerProps) => {
  const theme = useTheme();
  const [titleRef, titleIsTruncated] =
    useCSSTextTruncation<HTMLHeadingElement>();

  const [descriptionRef, descriptionIsTruncated] =
    useCSSTextTruncation<HTMLHeadingElement>();

  return (
    <div
      css={css`
        border-top: 1px solid ${theme.colorSplit};
        padding-top: ${theme.sizeUnit * 4}px;
        margin-bottom: ${theme.sizeUnit * 4}px;
      `}
    >
      <Tooltip overlay={titleIsTruncated ? <strong>{title}</strong> : null}>
        <h3
          ref={titleRef}
          css={css`
            ${truncationCSS};
            display: block;
            color: ${theme.colorText};
            font-weight: ${theme.fontWeightNormal};
            font-size: ${theme.fontSize}px;
            margin: 0 0 ${theme.sizeUnit}px 0;
          `}
        >
          {title}
        </h3>
      </Tooltip>
      {description ? (
        <Tooltip overlay={descriptionIsTruncated ? description : null}>
          <p
            ref={descriptionRef}
            data-test="divider-description"
            css={css`
              ${truncationCSS};
              display: block;
              font-size: ${theme.fontSizeSM}px;
              color: ${theme.colorTextDescription};
              margin: ${theme.sizeUnit}px 0 0 0;
            `}
          >
            {description}
          </p>
        </Tooltip>
      ) : null}
    </div>
  );
};

const FilterDivider = ({
  title,
  description,
  orientation = FilterBarOrientation.Vertical,
  overflow = false,
}: FilterDividerProps) => {
  if (orientation === FilterBarOrientation.Horizontal) {
    if (overflow) {
      return (
        <HorizontalOverflowDivider title={title} description={description} />
      );
    }

    return <HorizontalDivider title={title} description={description} />;
  }

  return <VerticalDivider title={title} description={description} />;
};

export default FilterDivider;
