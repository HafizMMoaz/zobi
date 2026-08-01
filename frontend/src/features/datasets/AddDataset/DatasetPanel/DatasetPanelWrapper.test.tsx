import { render, waitFor } from 'spec/helpers/testing-library';
import { ZobiClient } from '@zobi-ui/core';
import DatasetPanelWrapper from 'src/features/datasets/AddDataset/DatasetPanel';

jest.mock(
  '@zobi-ui/core/components/Icons/AsyncIcon',
  () =>
    ({ fileName }: { fileName: string }) => (
      <span role="img" aria-label={fileName.replace('_', '-')} />
    ),
);

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetches table metadata for schema-less database without schema', async () => {
  const getSpy = jest.spyOn(ZobiClient, 'get').mockResolvedValue({
    json: {
      name: 'my_table',
      columns: [{ name: 'id', type: 'INTEGER', longType: 'INTEGER' }],
    },
  } as any);

  render(
    <DatasetPanelWrapper
      tableName="my_table"
      dbId={1}
      database={{ supports_schemas: false }}
    />,
    { useRouter: true },
  );

  await waitFor(() => {
    expect(getSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: expect.stringContaining('/api/v1/database/1/table_metadata/'),
      }),
    );
  });
});
