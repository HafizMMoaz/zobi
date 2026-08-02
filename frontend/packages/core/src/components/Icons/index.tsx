import { FC } from 'react';
import { antdEnhancedIcons } from './AntdEnhanced';
import AsyncIcon from './AsyncIcon';

import type { IconType } from './types';

/**
 * Filename is going to be inferred from the icon name.
 * i.e. BigNumberChartTile => assets/images/icons/big_number_chart_tile
 */
const customIcons = [
  'Ballot',
  'BigNumberChartTile',
  'Binoculars',
  'Category',
  'Certified',
  'CheckboxHalf',
  'CheckboxOff',
  'CheckboxOn',
  'CircleSolid',
  'Drag',
  'ErrorSolidSmallRed',
  'Error',
  'Full',
  'Layers',
  'Move',
  'Multiple',
  'Queued',
  'Redo',
  'Running',
  'Sigma',
  'Slack',
  'Square',
  'SortAsc',
  'SortDesc',
  'Sort',
  'Transparent',
  'TriangleDown',
  'Undo',
] as const;

type CustomIconType = Record<(typeof customIcons)[number], FC<IconType>>;

const iconOverrides: CustomIconType = {} as CustomIconType;
customIcons.forEach(customIcon => {
  const fileName = customIcon
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
  iconOverrides[customIcon] = (props: IconType) => (
    <AsyncIcon customIcons fileName={fileName} {...props} />
  );
});

export type IconNameType =
  | keyof typeof antdEnhancedIcons
  | keyof typeof iconOverrides;

type IconComponentType = Record<IconNameType, FC<IconType>>;

export const Icons: IconComponentType = {
  ...antdEnhancedIcons,
  ...iconOverrides,
};
export type { IconType };
