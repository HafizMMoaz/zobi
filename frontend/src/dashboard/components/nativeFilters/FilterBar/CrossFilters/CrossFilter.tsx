
import { useCallback } from 'react';
import { css, useTheme } from '@zobi/core/theme';
import { CrossFilterIndicator } from 'src/dashboard/components/nativeFilters/selectors';
import { useDispatch } from 'react-redux';
import { setDirectPathToChild } from 'src/dashboard/actions/dashboardState';
import { FilterBarOrientation } from 'src/dashboard/types';
import { updateDataMask } from 'src/dataMask/actions';
import CrossFilterTag from './CrossFilterTag';
import CrossFilterTitle from './CrossFilterTitle';

const CrossFilter = (props: {
  filter: CrossFilterIndicator;
  orientation: FilterBarOrientation;
  last?: boolean;
}) => {
  const { filter, orientation, last } = props;
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleHighlightFilterSource = useCallback(
    (path?: string[]) => {
      if (path) {
        dispatch(setDirectPathToChild(path));
      }
    },
    [dispatch],
  );

  const handleRemoveCrossFilter = (chartId: number) => {
    dispatch(
      updateDataMask(chartId, {
        extraFormData: {
          filters: [],
        },
        filterState: {
          value: null,
          selectedValues: null,
        },
      }),
    );
  };

  return (
    <div
      key={`${filter.name}${filter.emitterId}`}
      css={css`
        ${orientation === FilterBarOrientation.Vertical
          ? `
            display: block;
            margin-bottom: ${theme.sizeUnit * 4}px;
          `
          : `
            display: flex;
          `}
      `}
    >
      <CrossFilterTitle
        title={filter.name}
        orientation={orientation || FilterBarOrientation.Horizontal}
        onHighlightFilterSource={() => handleHighlightFilterSource(filter.path)}
      />
      {(filter.column || filter.value) && (
        <CrossFilterTag
          filter={filter}
          orientation={orientation}
          removeCrossFilter={handleRemoveCrossFilter}
        />
      )}
      {last && (
        <div
          data-test="cross-filters-divider"
          css={css`
            ${orientation === FilterBarOrientation.Horizontal
              ? `
                width: 1px;
                height: 22px;
                margin-left: ${theme.sizeUnit * 4}px;
                margin-right: ${theme.sizeUnit}px;
                flex-shrink: 0;
              `
              : `
                width: 100%;
                height: 1px;
                display: block;
                margin-bottom: ${theme.sizeUnit * 4}px;
                margin-top: ${theme.sizeUnit * 4}px;
            `}
            background: ${theme.colorSplit};
          `}
        />
      )}
    </div>
  );
};

export default CrossFilter;
