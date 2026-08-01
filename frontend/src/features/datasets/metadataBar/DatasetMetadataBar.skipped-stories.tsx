import { useResizeDetector } from 'react-resize-detector';
import { ZobiClient } from '@zobi.dev/core';
import { css } from '@zobi.dev/extension-api/theme';
import { useDatasetMetadataBar } from './useDatasetMetadataBar';

export default {
  title: 'Design System/Components/MetadataBar/Examples',
  parameters: {
    mockData: [
      {
        url: '/api/v1/dataset/1',
        method: 'GET',
        status: 200,
        response: {
          result: {
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
          },
        },
      },
    ],
  },
};

export const DatasetSpecific = () => {
  ZobiClient.reset();
  ZobiClient.configure({ csrfToken: '1234' }).init();

  const mockDataset = {
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

  const { metadataBar } = useDatasetMetadataBar({ dataset: mockDataset });
  const { width, height, ref } = useResizeDetector();
  // eslint-disable-next-line no-param-reassign
  return (
    <div
      ref={ref}
      css={css`
        margin-top: 70px;
        margin-left: 80px;
        overflow: auto;
        min-width: ${168}px;
        max-width: ${740}px;
        resize: horizontal;
      `}
    >
      {metadataBar}
      <span
        css={css`
          position: absolute;
          top: 150px;
          left: 115px;
        `}
      >{`${width}x${height}`}</span>
    </div>
  );
};
