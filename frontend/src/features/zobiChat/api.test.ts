import fetchMock from 'fetch-mock';
import { fetchTools, fetchChatModels } from './api';

afterEach(() => {
  fetchMock.removeRoutes().clearHistory();
});

test('fetchTools requests the tools for a mode', async () => {
  fetchMock.get('glob:*/api/v1/zobi_agent/tools/?mode=read_only', {
    result: [
      {
        name: 'list_datasets',
        title: 'List datasets',
        risk: 'read',
        description: 'Lists datasets',
      },
    ],
  });

  const tools = await fetchTools('read_only');

  expect(tools).toHaveLength(1);
  expect(tools[0].name).toEqual('list_datasets');
});

test('fetchChatModels returns the selectable aliases', async () => {
  fetchMock.get('glob:*/api/v1/zobi_agent/models/', {
    result: [
      { alias: 'fast', is_default: false },
      { alias: 'gpt-4o', is_default: true },
    ],
  });

  const models = await fetchChatModels();

  expect(models.map(model => model.alias)).toEqual(['fast', 'gpt-4o']);
  expect(models.find(model => model.is_default)?.alias).toEqual('gpt-4o');
});
