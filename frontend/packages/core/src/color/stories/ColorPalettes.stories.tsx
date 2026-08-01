

import {
  CategoricalAirbnb,
  CategoricalD3,
  CategoricalEcharts,
  CategoricalGoogle,
  CategoricalLyft,
  CategoricalPreset,
  CategoricalZobi,
  SequentialCommon,
  SequentialD3,
} from '@zobi.dev/core';
import RenderPalettes from './RenderPalettes';

export default {
  title: 'Core Packages/@zobi.dev-color',
};

export const categoricalPalettes = () =>
  [
    { palettes: CategoricalZobi, storyName: 'Zobi' },
    { palettes: CategoricalAirbnb, storyName: 'Airbnb' },
    { palettes: CategoricalD3, storyName: 'd3' },
    { palettes: CategoricalEcharts, storyName: 'ECharts' },
    { palettes: CategoricalGoogle, storyName: 'Google' },
    { palettes: CategoricalLyft, storyName: 'Lyft' },
    { palettes: CategoricalPreset, storyName: 'Preset' },
  ].map(({ palettes, storyName }) => (
    <RenderPalettes key={storyName} title={storyName} palettes={palettes} />
  ));

export const sequentialPalettes = () =>
  [
    { palettes: SequentialCommon, storyName: 'Common' },
    { palettes: SequentialD3, storyName: 'd3' },
  ].map(({ palettes, storyName }) => (
    <RenderPalettes key={storyName} title={storyName} palettes={palettes} />
  ));
