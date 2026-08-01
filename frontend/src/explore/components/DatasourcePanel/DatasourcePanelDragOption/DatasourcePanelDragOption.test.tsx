import { render, screen } from 'spec/helpers/testing-library';
import { DndItemType } from 'src/explore/components/DndItemType';
import DatasourcePanelDragOption from '.';

test('should render', async () => {
  render(
    <DatasourcePanelDragOption
      value={{ metric_name: 'test', uuid: '1' }}
      type={DndItemType.Metric}
    />,
    { useDnd: true, useRedux: true, initialState: { explore: {} } },
  );

  expect(
    await screen.findByTestId('DatasourcePanelDragOption'),
  ).toBeInTheDocument();
  expect(screen.getByText('test')).toBeInTheDocument();
});

test('should have attribute draggable:true', async () => {
  render(
    <DatasourcePanelDragOption
      value={{ metric_name: 'test', uuid: '1' }}
      type={DndItemType.Metric}
    />,
    { useDnd: true, useRedux: true, initialState: { explore: {} } },
  );

  expect(
    await screen.findByTestId('DatasourcePanelDragOption'),
  ).toHaveAttribute('draggable', 'true');
});
