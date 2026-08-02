import { css } from '@zobi.dev/extension-api/theme';
import { FilterBarOrientation } from 'src/dashboard/types';
import FilterDivider from './FilterDivider';
import { FilterDividerProps } from './types';

export default {
  title: 'Components/FilterDivider',
  component: FilterDivider,
};

export const VerticalFilterDivider = (props: FilterDividerProps) => (
  <div
    css={css`
      background-color: #ddd;
      padding: 50px;
    `}
  >
    <div
      css={css`
        display: flex;
        flex-direction: column;
        width: 259px;
        padding: 16px;
        background-color: white;
      `}
    >
      <FilterDivider {...props} />
    </div>
  </div>
);

export const HorizontalFilterDivider = (props: FilterDividerProps) => (
  <div
    css={css`
      background-color: #ddd;
      padding: 50px;
    `}
  >
    <div
      css={css`
        height: 48px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        background-color: white;
      `}
    >
      <FilterDivider orientation={FilterBarOrientation.Horizontal} {...props} />
    </div>
  </div>
);

export const HorizontalOverflowFilterDivider = (props: FilterDividerProps) => (
  <div
    css={css`
      background-color: #ddd;
      padding: 50px;
    `}
  >
    <div
      css={css`
        width: 224px;
        padding: 16px;
        background-color: white;
      `}
    >
      <FilterDivider {...props} />
    </div>
  </div>
);

const args = {
  title: 'Sample title',
  description: 'Sample description',
};

VerticalFilterDivider.args = {
  ...args,
  horizontal: false,
  overflow: false,
};

HorizontalFilterDivider.args = {
  ...args,
  horizontal: true,
  overflow: false,
};

HorizontalOverflowFilterDivider.args = {
  ...args,
  horizontal: true,
  overflow: true,
};
