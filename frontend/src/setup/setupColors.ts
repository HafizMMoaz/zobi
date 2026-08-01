import {
  CategoricalScheme,
  ColorScheme,
  ColorSchemeConfig,
  getCategoricalSchemeRegistry,
  getSequentialSchemeRegistry,
  SequentialScheme,
  SequentialSchemeConfig,
  CategoricalAirbnb,
  CategoricalD3,
  CategoricalEcharts,
  CategoricalGoogle,
  CategoricalLyft,
  CategoricalPreset,
  CategoricalZobi,
  SequentialCommon,
  SequentialD3,
  ColorSchemeRegistry,
  ColorSchemeGroup,
  CategoricalPresetZobi,
  CategoricalModernSunset,
  CategoricalColorsOfRainbow,
  CategoricalBlueToGreen,
  CategoricalRedToYellow,
  CategoricalWavesOfBlue,
} from '@zobi.dev/core';

function registerColorSchemes<T extends ColorScheme>(
  registry: ColorSchemeRegistry<T>,
  colorSchemes: T[],
  standardDefaultKey: string,
) {
  colorSchemes.forEach(scheme => {
    registry.registerValue(scheme.id, scheme);
  });

  const defaultKey =
    colorSchemes.find(scheme => scheme.isDefault)?.id || standardDefaultKey;
  registry.setDefaultKey(defaultKey);
}

export default function setupColors(
  extraCategoricalColorSchemeConfigs: ColorSchemeConfig[] = [],
  extraSequentialColorSchemeConfigs: SequentialSchemeConfig[] = [],
) {
  const extraCategoricalColorSchemes = extraCategoricalColorSchemeConfigs.map(
    config =>
      new CategoricalScheme({ ...config, group: ColorSchemeGroup.Custom }),
  );
  const extraSequentialColorSchemes = extraSequentialColorSchemeConfigs.map(
    config => new SequentialScheme(config),
  );
  registerColorSchemes(
    getCategoricalSchemeRegistry(),
    [
      ...CategoricalAirbnb,
      ...CategoricalD3,
      ...CategoricalEcharts,
      ...CategoricalGoogle,
      ...CategoricalLyft,
      ...CategoricalPreset,
      ...CategoricalZobi,
      ...CategoricalPresetZobi,
      ...CategoricalModernSunset,
      ...CategoricalColorsOfRainbow,
      ...CategoricalBlueToGreen,
      ...CategoricalRedToYellow,
      ...CategoricalWavesOfBlue,
      ...extraCategoricalColorSchemes,
    ],
    'zobiColors',
  );
  registerColorSchemes(
    getSequentialSchemeRegistry(),
    [...SequentialCommon, ...SequentialD3, ...extraSequentialColorSchemes],
    'zobi_seq_1',
  );
}
