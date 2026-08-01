/* eslint-disable react/jsx-sort-default-props */
/* eslint-disable react/sort-prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { memo } from 'react';
import { formatNumber } from '@zobi-ui/core';
import { styled } from '@zobi/core/theme';
import { Color } from '@deck.gl/core';

const StyledLegend = styled.div`
  ${({ theme }) => `
    font-size: ${theme.fontSizeSM}px;
    position: absolute;
    background: ${theme.colorBgElevated};
    box-shadow: 0 0 ${theme.sizeUnit}px ${theme.colorBorderSecondary};
    margin: ${theme.sizeUnit * 6}px;
    padding: ${theme.sizeUnit * 3}px ${theme.sizeUnit * 5}px;
    outline: none;
    overflow-y: scroll;
    max-height: 200px;
    border: 1px solid ${theme.colorBorder};
    border-radius: ${theme.borderRadius}px;

    & ul {
      list-style: none;
      padding-left: 0;
      margin: 0;

      & li a {
        display: flex;
        color: ${theme.colorText};
        text-decoration: none;
        padding: ${theme.sizeUnit}px 0;

        & span {
          margin-right: ${theme.sizeUnit}px;
        }
      }
    }
  `}
`;

const categoryDelimiter = ' - ';

export type LegendProps = {
  format: string | null;
  forceCategorical?: boolean;
  position?: null | 'tl' | 'tr' | 'bl' | 'br';
  categories: Record<string, { enabled: boolean; color: Color | undefined }>;
  toggleCategory?: (key: string) => void;
  showSingleCategory?: (key: string) => void;
};

const Legend = ({
  format: d3Format = null,
  forceCategorical = false,
  position = 'tr',
  categories: categoriesObject = {},
  toggleCategory = () => {},
  showSingleCategory = () => {},
}: LegendProps) => {
  const format = (value: string) => {
    if (!d3Format || forceCategorical) {
      return value;
    }

    const numValue = parseFloat(value);

    return formatNumber(d3Format, numValue);
  };

  const formatCategoryLabel = (k: string) => {
    if (!d3Format) {
      return k;
    }

    if (k.includes(categoryDelimiter)) {
      const values = k.split(categoryDelimiter);

      return format(values[0]) + categoryDelimiter + format(values[1]);
    }

    return format(k);
  };

  if (Object.keys(categoriesObject).length === 0 || position === null) {
    return null;
  }

  const categories = Object.entries(categoriesObject).map(([k, v]) => {
    const style = { color: `rgba(${v.color?.join(', ')})` };
    const icon = v.enabled ? '\u25FC' : '\u25FB';

    return (
      <li key={k}>
        <a
          href="#"
          role="button"
          onClick={e => {
            e.preventDefault();
            toggleCategory(k);
          }}
          onDoubleClick={e => {
            e.preventDefault();
            showSingleCategory(k);
          }}
        >
          <span style={style}>{icon}</span> {formatCategoryLabel(k)}
        </a>
      </li>
    );
  });

  const vertical = position?.charAt(0) === 't' ? 'top' : 'bottom';
  const horizontal = position?.charAt(1) === 'r' ? 'right' : 'left';
  const style = {
    position: 'absolute' as const,
    [vertical]: '0px',
    [horizontal]: '10px',
  };

  return (
    <StyledLegend className="dupa" style={style}>
      <ul>{categories}</ul>
    </StyledLegend>
  );
};

export default memo(Legend);
