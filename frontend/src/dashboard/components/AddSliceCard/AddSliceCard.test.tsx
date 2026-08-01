
import { FeatureFlag, VizType } from '@zobi.dev/core';
import {
  act,
  render,
  screen,
  userEvent,
  within,
} from 'spec/helpers/testing-library';
import AddSliceCard from './AddSliceCard';

jest.mock('src/components/DynamicPlugins', () => ({
  usePluginContext: () => ({
    mountedPluginMetadata: { table: { name: 'Table' } },
  }),
}));

const mockedProps = {
  visType: VizType.Table,
  sliceName: '-',
};

declare const globalThis: {
  featureFlags: Record<string, boolean>;
};

test('do not render thumbnail if feature flag is not set', async () => {
  globalThis.featureFlags = {
    [FeatureFlag.Thumbnails]: false,
  };

  await act(async () => {
    render(<AddSliceCard {...mockedProps} />);
  });

  expect(screen.queryByTestId('thumbnail')).not.toBeInTheDocument();
});

test('render thumbnail if feature flag is set', async () => {
  globalThis.featureFlags = {
    [FeatureFlag.Thumbnails]: true,
  };

  await act(async () => {
    render(<AddSliceCard {...mockedProps} />);
  });

  expect(screen.queryByTestId('thumbnail')).toBeInTheDocument();
});

test('does not render the tooltip with anchors', async () => {
  const mock = jest
    .spyOn(global.React, 'useState')
    .mockImplementation(() => [true, jest.fn()]);
  render(
    <AddSliceCard
      {...mockedProps}
      datasourceUrl="http://test.com"
      datasourceName="datasource-name"
    />,
  );
  userEvent.hover(screen.getByRole('link', { name: 'datasource-name' }));
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  const tooltip = await screen.findByRole('tooltip');
  expect(within(tooltip).queryByRole('link')).not.toBeInTheDocument();
  mock.mockRestore();
});
