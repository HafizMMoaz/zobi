
import { StoryFn, Meta } from '@storybook/react';
import DatasetPanel from './DatasetPanel';
import { exampleColumns } from './fixtures';

export default {
  title: 'Zobi App/views/CRUD/data/dataset/DatasetPanel',
  component: DatasetPanel,
} as Meta<typeof DatasetPanel>;

export const Basic: StoryFn<typeof DatasetPanel> = args => (
  <div style={{ height: '350px' }}>
    <DatasetPanel {...args} />
  </div>
);

Basic.args = {
  tableName: 'example_table',
  loading: false,
  hasError: false,
  columnList: exampleColumns,
};
