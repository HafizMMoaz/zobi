import { useEffect, useState } from 'react';
import { JsonObject, seed, SuperChart, SequentialD3 } from '@zobi.dev/core';
import { useTheme } from '@zobi.dev/extension-api/theme';
import CountryMapChartPlugin, { countries } from '@zobi.dev/country-map';
import { withResizableChartDemo } from '@storybook-shared';

new CountryMapChartPlugin().configure({ key: 'country-map' }).register();

export default {
  title: 'Legacy Chart Plugins/legacy-plugin-chart-country-map',
  decorators: [withResizableChartDemo],
  component: SuperChart,
  parameters: {
    initialSize: { width: 500, height: 300 },
  },
};

function generateData(geojson: JsonObject) {
  return geojson.features.map(
    (feat: {
      properties: { ISO: string };
      type: string;
      geometry: JsonObject;
    }) => ({
      metric: Math.round(Number(seed(feat.properties.ISO)()) * 10000) / 100,
      country_id: feat.properties.ISO,
    }),
  );
}

export const BasicCountryMapStory = ({
  country,
  colorSchema,
  width,
  height,
}: {
  country: string;
  colorSchema: string;
  width: number;
  height: number;
}) => {
  const theme = useTheme();
  const [data, setData] = useState<JsonObject>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetch(countries[country as keyof typeof countries], { signal })
      .then(resp => resp.json())
      .then(geojson => {
        setData(generateData(geojson));
      });
    return () => {
      controller.abort();
    };
  }, [country]);

  if (!data) {
    return (
      <div
        style={{
          color: theme.colorTextLabel,
          textAlign: 'center',
          padding: 20,
        }}
      >
        Loading...
      </div>
    );
  }
  return (
    <SuperChart
      chartType="country-map"
      width={width}
      height={height}
      queriesData={[{ data }]}
      formData={{
        linear_color_scheme: colorSchema,
        number_format: '.3s',
        select_country: country,
      }}
    />
  );
};

BasicCountryMapStory.args = {
  country: 'finland',
  colorSchema: 'schemeOranges',
};
BasicCountryMapStory.argTypes = {
  country: {
    control: 'select',
    options: Object.keys(countries),
  },
  colorSchema: {
    control: 'select',
    options: SequentialD3.map(x => x.id),
    description: 'Choose a color schema',
    defaultValue: 'schemeOranges',
  },
};
