import { ZobiClient } from '@zobi.dev/core';
import { postFormData, putFormData } from './formData';

jest.mock('@zobi.dev/core', () => ({
  ZobiClient: {
    post: jest.fn(),
    put: jest.fn(),
  },
}));

test('postFormData should call ZobiClient.post with correct payload and return key', async () => {
  const mockKey = '123abc';
  const mockResponse = { json: { key: mockKey } };

  (ZobiClient.post as jest.Mock).mockResolvedValue(mockResponse);

  const result = await postFormData(
    1,
    'table',
    { some: 'form', data: true },
    42,
    'tab-7',
  );

  expect(ZobiClient.post).toHaveBeenCalledWith({
    endpoint: 'api/v1/explore/form_data?tab_id=tab-7',
    jsonPayload: {
      datasource_id: 1,
      datasource_type: 'table',
      form_data: JSON.stringify({ some: 'form', data: true }), // assuming sanitizeFormData is a passthrough
      chart_id: 42,
    },
  });

  expect(result).toBe(mockKey);
});

test('putFormData should call ZobiClient.put with correct payload and return message', async () => {
  const mockMessage = 'Form data updated';
  const mockResponse = { json: { message: mockMessage } };

  (ZobiClient.put as jest.Mock).mockResolvedValue(mockResponse);

  const result = await putFormData(
    10,
    'druid',
    'abc123',
    { another: 'value' },
    undefined,
    'tab-5',
  );

  expect(ZobiClient.put).toHaveBeenCalledWith({
    endpoint: 'api/v1/explore/form_data/abc123?tab_id=tab-5',
    jsonPayload: {
      datasource_id: 10,
      datasource_type: 'druid',
      form_data: JSON.stringify({ another: 'value' }), // again, assuming sanitizeFormData is passthrough
    },
  });

  expect(result).toBe(mockMessage);
});

test('postFormData without optional params should work', async () => {
  (ZobiClient.post as jest.Mock).mockResolvedValue({
    json: { key: 'abc' },
  });

  await postFormData(2, 'table', { foo: 'bar' });

  expect(ZobiClient.post).toHaveBeenCalledWith({
    endpoint: 'api/v1/explore/form_data',
    jsonPayload: {
      datasource_id: 2,
      datasource_type: 'table',
      form_data: JSON.stringify({ foo: 'bar' }),
    },
  });
});
