import {
  render,
  screen,
  waitFor,
  userEvent,
} from 'spec/helpers/testing-library';
import { ZobiClient } from '@zobi.dev/core';

import AddSemanticViewModal from './AddSemanticViewModal';

jest.mock('@zobi.dev/core', () => ({
  ...jest.requireActual('@zobi.dev/core'),
  ZobiClient: {
    ...jest.requireActual('@zobi.dev/core').ZobiClient,
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedGet = ZobiClient.get as jest.Mock;
const mockedPost = ZobiClient.post as jest.Mock;

const createProps = () => ({
  show: true,
  onHide: jest.fn(),
  onSuccess: jest.fn(),
  addDangerToast: jest.fn(),
  addSuccessToast: jest.fn(),
});

const selectOption = async (name: string, optionLabel: string) => {
  const select = await screen.findByRole('combobox', { name });
  await userEvent.click(select);
  await userEvent.click(await screen.findByText(optionLabel));
};

beforeEach(() => {
  mockedGet.mockReset();
  mockedPost.mockReset();
});

test('loads layers on open and adds selected semantic views', async () => {
  mockedGet.mockResolvedValue({
    json: {
      result: [{ uuid: 'layer-1', name: 'Snowflake SL' }],
    },
  });

  mockedPost.mockImplementation(({ endpoint }: { endpoint: string }) => {
    if (endpoint === '/api/v1/semantic_layer/layer-1/schema/runtime') {
      return Promise.resolve({ json: { result: { properties: {} } } });
    }
    if (endpoint === '/api/v1/semantic_layer/layer-1/views') {
      return Promise.resolve({
        json: {
          result: [
            { name: 'orders', already_added: false },
            { name: 'customers', already_added: true },
          ],
        },
      });
    }
    if (endpoint === '/api/v1/semantic_view/') {
      return Promise.resolve({
        json: {
          result: {
            created: [{ uuid: 'view-1', name: 'orders' }],
          },
        },
      });
    }
    return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
  });

  const props = createProps();
  render(<AddSemanticViewModal {...props} />);

  await waitFor(() => {
    expect(mockedGet).toHaveBeenCalledWith({
      endpoint: '/api/v1/semantic_layer/',
    });
  });

  await selectOption('Semantic layer', 'Snowflake SL');

  await waitFor(() => {
    expect(mockedPost).toHaveBeenCalledWith({
      endpoint: '/api/v1/semantic_layer/layer-1/schema/runtime',
      jsonPayload: {},
    });
  });

  await waitFor(() => {
    expect(mockedPost).toHaveBeenCalledWith({
      endpoint: '/api/v1/semantic_layer/layer-1/views',
      jsonPayload: { runtime_data: {} },
    });
  });

  await selectOption('Semantic views', 'orders');
  await userEvent.click(
    screen.getByRole('button', { name: /add 1 view\(s\)/i }),
  );

  await waitFor(() => {
    expect(mockedPost).toHaveBeenCalledWith({
      endpoint: '/api/v1/semantic_view/',
      jsonPayload: {
        views: [
          {
            name: 'orders',
            semantic_layer_uuid: 'layer-1',
            configuration: {},
          },
        ],
      },
    });
  });

  expect(props.addSuccessToast).toHaveBeenCalledWith(
    '1 semantic view(s) added',
  );
  expect(props.onSuccess).toHaveBeenCalled();
  expect(props.onHide).toHaveBeenCalled();
});

test('shows partial success feedback when only some semantic views are created', async () => {
  mockedGet.mockResolvedValue({
    json: {
      result: [{ uuid: 'layer-1', name: 'Snowflake SL' }],
    },
  });

  mockedPost.mockImplementation(({ endpoint }: { endpoint: string }) => {
    if (endpoint === '/api/v1/semantic_layer/layer-1/schema/runtime') {
      return Promise.resolve({ json: { result: { properties: {} } } });
    }
    if (endpoint === '/api/v1/semantic_layer/layer-1/views') {
      return Promise.resolve({
        json: {
          result: [
            { name: 'orders', already_added: false },
            { name: 'customers', already_added: false },
          ],
        },
      });
    }
    if (endpoint === '/api/v1/semantic_view/') {
      return Promise.resolve({
        json: {
          result: {
            created: [{ uuid: 'view-1', name: 'orders' }],
            errors: [{ name: 'customers', error: 'create failed' }],
          },
        },
      });
    }
    return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
  });

  const props = createProps();
  render(<AddSemanticViewModal {...props} />);

  await selectOption('Semantic layer', 'Snowflake SL');
  await waitFor(() => {
    expect(
      screen.getByRole('combobox', { name: 'Semantic views' }),
    ).toBeInTheDocument();
  });

  await selectOption('Semantic views', 'orders');
  await selectOption('Semantic views', 'customers');
  await userEvent.click(
    screen.getByRole('button', { name: /add 2 view\(s\)/i }),
  );

  await waitFor(() => {
    expect(props.addSuccessToast).toHaveBeenCalledWith(
      '1 semantic view(s) added',
    );
    expect(props.addDangerToast).toHaveBeenCalledWith(
      '1 semantic view(s) failed to add: customers',
    );
  });
  expect(props.onSuccess).not.toHaveBeenCalled();
  expect(props.onHide).not.toHaveBeenCalled();
});

test('shows toast when loading semantic layers fails', async () => {
  mockedGet.mockRejectedValue(new Error('boom'));
  const props = createProps();

  render(<AddSemanticViewModal {...props} />);

  await waitFor(() => {
    expect(props.addDangerToast).toHaveBeenCalledWith(
      'An error occurred while fetching semantic layers',
    );
  });
});

test('shows toast when add semantic views fails', async () => {
  mockedGet.mockResolvedValue({
    json: {
      result: [{ uuid: 'layer-1', name: 'Snowflake SL' }],
    },
  });

  mockedPost.mockImplementation(({ endpoint }: { endpoint: string }) => {
    if (endpoint === '/api/v1/semantic_layer/layer-1/schema/runtime') {
      return Promise.resolve({ json: { result: { properties: {} } } });
    }
    if (endpoint === '/api/v1/semantic_layer/layer-1/views') {
      return Promise.resolve({
        json: {
          result: [{ name: 'orders', already_added: false }],
        },
      });
    }
    if (endpoint === '/api/v1/semantic_view/') {
      return Promise.reject(new Error('save failed'));
    }
    return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
  });

  const props = createProps();
  render(<AddSemanticViewModal {...props} />);

  await selectOption('Semantic layer', 'Snowflake SL');
  await waitFor(() => {
    expect(
      screen.getByRole('combobox', { name: 'Semantic views' }),
    ).toBeInTheDocument();
  });

  await selectOption('Semantic views', 'orders');
  await userEvent.click(
    screen.getByRole('button', { name: /add 1 view\(s\)/i }),
  );

  await waitFor(() => {
    expect(props.addDangerToast).toHaveBeenCalledWith(
      'An error occurred while adding semantic views',
    );
  });
});
