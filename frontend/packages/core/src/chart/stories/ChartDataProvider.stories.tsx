import { SuperChart, ChartDataProvider, ZobiClient } from '@zobi.dev/core';
import { BigNumberChartPlugin } from '@zobi.dev/echarts';
import { WordCloudChartPlugin } from '@zobi.dev/word-cloud';

import {
  bigNumberFormData,
  sankeyFormData,
  sunburstFormData,
  wordCloudFormData,
} from '../../../../core/test/chart/fixtures/formData';

import { Expandable } from '@storybook-shared';
import { VerifyCORS, renderError } from '@storybook-shared';

const BIG_NUMBER = bigNumberFormData.viz_type;
const SANKEY = sankeyFormData.viz_type;
const SUNBURST = sunburstFormData.viz_type;
const WORD_CLOUD_LEGACY = wordCloudFormData.viz_type;
const WORD_CLOUD = 'new_word_cloud';

new BigNumberChartPlugin().configure({ key: BIG_NUMBER }).register();
// eslint-disable-next-line
new WordCloudChartPlugin().configure({ key: WORD_CLOUD }).register();

const VIS_TYPES = [BIG_NUMBER, SANKEY, SUNBURST, WORD_CLOUD, WORD_CLOUD_LEGACY];
const FORM_DATA_LOOKUP = {
  [BIG_NUMBER]: bigNumberFormData,
  [SANKEY]: sankeyFormData,
  [SUNBURST]: sunburstFormData,
  [WORD_CLOUD]: { ...wordCloudFormData, viz_type: WORD_CLOUD },
  [WORD_CLOUD_LEGACY]: wordCloudFormData,
};

export default {
  title: 'Others/DataProvider',
  decorators: [],
};

export const dataProvider = ({
  host,
  visType,
  width,
  height,
  formData,
}: {
  host: string;
  visType: string;
  width: number;
  height: number;
  formData: string;
}) => (
  <div style={{ margin: 16 }}>
    <VerifyCORS host={host}>
      {() => (
        <ChartDataProvider client={ZobiClient} formData={JSON.parse(formData)}>
          {({ loading, payload, error }) => {
            if (loading) return <div>Loading!</div>;

            if (error) return renderError(error);

            if (payload)
              return (
                <>
                  <SuperChart
                    chartType={visType}
                    formData={payload.formData}
                    height={Number(height)}
                    // @TODO fix typing
                    // all vis's now expect objects but api/v1/ returns an array
                    queriesData={payload.queriesData}
                    width={Number(width)}
                  />
                  <br />
                  <Expandable expandableWhat="payload">
                    <pre style={{ fontSize: 11 }}>
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  </Expandable>
                </>
              );

            return null;
          }}
        </ChartDataProvider>
      )}
    </VerifyCORS>
  </div>
);

dataProvider.storyName = 'ChartDataProvider';

dataProvider.args = {
  host: 'localhost:8088',
  visType: VIS_TYPES[0],
  width: '500',
  height: '300',
  formData: JSON.stringify(FORM_DATA_LOOKUP[VIS_TYPES[0]]),
};
dataProvider.argTypes = {
  host: {
    control: 'text',
    description: 'Set Zobi App host for CORS request',
  },
  visType: {
    control: 'select',
    options: VIS_TYPES,
    description: 'Chart Plugin Type',
  },
  width: { control: 'text', description: 'Vis width' },
  height: { control: 'text', description: 'Vis height' },
  formData: { control: 'text', description: 'Override formData' },
};
