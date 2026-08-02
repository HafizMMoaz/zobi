import fetchMock from 'fetch-mock';
import { renderHook } from '@testing-library/react';
import { createWrapper, render } from 'spec/helpers/testing-library';
import { zobiGetCache } from 'src/utils/cachedZobiGet';
import { useDatasetMetadataBar } from './useDatasetMetadataBar';

const MOCK_DATASET = {
  changed_on: '2023-01-26T12:06:58.733316',
  changed_on_humanized: 'a month ago',
  changed_by: { first_name: 'Han', last_name: 'Solo' },
  created_by: { first_name: 'Luke', last_name: 'Skywalker' },
  created_on: '2023-01-26T12:06:54.965034',
  created_on_humanized: 'a month ago',
  table_name: `This is dataset's name`,
  owners: [
    { first_name: 'John', last_name: 'Doe' },
    { first_name: 'Luke', last_name: 'Skywalker' },
  ],
  description: 'This is a dataset description',
};

afterEach(() => {
  fetchMock.clearHistory().removeRoutes();
  zobiGetCache.clear();
});

test('renders dataset metadata bar with dataset prop', async () => {
  const { result } = renderHook(
    () => useDatasetMetadataBar({ dataset: MOCK_DATASET }),
    {
      wrapper: createWrapper(),
    },
  );

  expect(result.current.metadataBar).not.toBeNull();
  const { findByText, findAllByRole } = render(result.current.metadataBar!);
  expect(await findByText(`This is dataset's name`)).toBeVisible();
  expect(await findByText('This is a dataset description')).toBeVisible();
  expect(await findByText('Luke Skywalker')).toBeVisible();
  expect(await findByText('a month ago')).toBeVisible();
  expect(await findAllByRole('img')).toHaveLength(4);
});

test('renders dataset metadata bar with minimal dataset', async () => {
  const minimalDataset = {
    changed_on: '2023-01-26T12:06:58.733316',
    changed_on_humanized: 'a month ago',
    created_on: '2023-01-26T12:06:54.965034',
    created_on_humanized: 'a month ago',
    table_name: `This is dataset's name`,
    description: undefined,
    owners: [],
  } as any;

  const { result } = renderHook(
    () => useDatasetMetadataBar({ dataset: minimalDataset }),
    {
      wrapper: createWrapper(),
    },
  );

  expect(result.current.metadataBar).not.toBeNull();
  const { findByText, queryByText, findAllByRole } = render(
    result.current.metadataBar!,
  );
  expect(await findByText(`This is dataset's name`)).toBeVisible();
  expect(queryByText('This is a dataset description')).not.toBeInTheDocument();
  expect(await findByText('Not available')).toBeVisible();
  expect(await findByText('a month ago')).toBeVisible();
  expect(await findAllByRole('img')).toHaveLength(3);
});
