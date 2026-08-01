

import { bigNumberFormData } from '../../../test/chart/fixtures/formData';
import {
  VerifyCORS,
  Expandable,
  type VerifyCORSProps,
} from '@storybook-shared';

const REQUEST_METHODS = ['GET', 'POST'];
const ENDPOINTS = {
  '(Empty - verify auth only)': '/',
  '/api/v1/chart/data': '/api/v1/chart/data',
};

export default {
  title: 'Core Packages/@zobi-ui-connection',
  decorators: [
    // withKnobs({
    //   escapeHTML: false,
    // }),
  ],
};

export const ConfigureCORS = ({
  host,
  selectEndpoint,
  customEndpoint,
  methodOption,
  postPayloadContents,
}: {
  host: string;
  selectEndpoint: string;
  customEndpoint: string;
  methodOption: string;
  postPayloadContents: string;
}) => {
  const endpoint = customEndpoint || selectEndpoint;
  const method = endpoint ? methodOption : undefined;
  const postPayload =
    endpoint && method === 'POST' ? postPayloadContents : undefined;

  return (
    <div style={{ margin: 16 }}>
      <VerifyCORS
        host={host}
        endpoint={endpoint}
        method={method as VerifyCORSProps['method']}
        postPayload={`${postPayload}`}
      >
        {({ payload }) => (
          <>
            <div className="alert alert-success">
              Success! Update controls below to try again
            </div>
            <br />
            <Expandable expandableWhat="payload">
              <br />
              <pre style={{ fontSize: 11 }}>
                {JSON.stringify(payload, null, 2)}
              </pre>
            </Expandable>
          </>
        )}
      </VerifyCORS>
    </div>
  );
};
ConfigureCORS.args = {
  host: 'localhost:8088',
  selectEndpoint: '/api/v1/chart/data',
  customEndpoint: '',
  methodOption: 'POST', // TODO disable when custonEndpoint and selectEndpoint are empty
  postPayloadContents: JSON.stringify({ form_data: bigNumberFormData }),
};
ConfigureCORS.argTypes = {
  host: {
    control: 'text',
    description: 'Set Zobi App host for CORS request',
  },
  selectEndpoint: {
    control: {
      type: 'select',
      options: Object.keys(ENDPOINTS),
    },
    mapping: ENDPOINTS,
    description: 'Select an endpoint',
  },
  customEndpoint: {
    control: 'text',
    description: 'Custom Endpoint (override above)',
  },
  methodOption: {
    control: 'select',
    options: REQUEST_METHODS,
    description: 'Select a request method',
  },
  postPayloadContents: {
    control: 'text',
    description: 'Set POST payload contents',
  },
};
ConfigureCORS.storyName = 'Verify CORS';
