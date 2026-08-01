import { ZobiClient } from '@zobi.dev/core';
import { render, waitFor } from 'spec/helpers/testing-library';

import SemanticLayerModal from './SemanticLayerModal';

let mockJsonFormsChangeTriggered = false;

jest.mock('@jsonforms/react', () => ({
  ...jest.requireActual('@jsonforms/react'),
  JsonForms: ({ onChange }: { onChange: (value: unknown) => void }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (!mockJsonFormsChangeTriggered) {
      mockJsonFormsChangeTriggered = true;
      onChange({
        data: { warehouse: 'wh1' },
        errors: [],
      });
    }
    return null;
  },
}));

jest.mock('@zobi.dev/core', () => ({
  ...jest.requireActual('@zobi.dev/core'),
  ZobiClient: {
    ...jest.requireActual('@zobi.dev/core').ZobiClient,
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
  getClientErrorObject: jest.fn(() => Promise.resolve({ error: '' })),
}));

const mockedGet = ZobiClient.get as jest.Mock;
const mockedPost = ZobiClient.post as jest.Mock;

const props = {
  show: true,
  onHide: jest.fn(),
  addDangerToast: jest.fn(),
  addSuccessToast: jest.fn(),
  semanticLayerUuid: '11111111-1111-1111-1111-111111111111',
};

beforeEach(() => {
  mockJsonFormsChangeTriggered = false;
  jest.useFakeTimers({ advanceTimers: true });
  mockedGet.mockReset();
  mockedPost.mockReset();

  mockedGet
    .mockResolvedValueOnce({
      json: {
        result: [{ id: 'snowflake', name: 'Snowflake', description: '' }],
      },
    })
    .mockResolvedValueOnce({
      json: {
        result: {
          name: 'Layer 1',
          type: 'snowflake',
          configuration: { warehouse: 'wh0' },
        },
      },
    });

  mockedPost.mockResolvedValue({
    json: {
      result: {
        type: 'object',
        properties: {
          warehouse: {
            type: 'string',
            'x-dynamic': true,
            'x-dependsOn': ['warehouse'],
          },
        },
      },
    },
  });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('posts configuration schema refresh after debounce', async () => {
  render(<SemanticLayerModal {...props} />);

  await waitFor(() => {
    expect(mockedPost).toHaveBeenNthCalledWith(1, {
      endpoint: '/api/v1/semantic_layer/schema/configuration',
      jsonPayload: {
        type: 'snowflake',
        configuration: { warehouse: 'wh0' },
      },
    });
  });

  jest.advanceTimersByTime(501);

  await waitFor(() => {
    expect(mockedPost).toHaveBeenNthCalledWith(2, {
      endpoint: '/api/v1/semantic_layer/schema/configuration',
      jsonPayload: {
        type: 'snowflake',
        configuration: { warehouse: 'wh1' },
      },
    });
  });
});
