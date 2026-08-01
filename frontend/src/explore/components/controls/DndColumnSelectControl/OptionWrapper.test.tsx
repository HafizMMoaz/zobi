import { render, screen, fireEvent } from 'spec/helpers/testing-library';
import { DndItemType } from 'src/explore/components/DndItemType';
import OptionWrapper from 'src/explore/components/controls/DndColumnSelectControl/OptionWrapper';

test('renders with default props', async () => {
  const { container } = render(
    <OptionWrapper
      index={1}
      clickClose={jest.fn()}
      type={'Column' as DndItemType}
      onShiftOptions={jest.fn()}
      label="Option"
    />,
    { useDnd: true },
  );
  expect(container).toBeInTheDocument();
  expect(await screen.findByRole('img', { name: 'close' })).toBeInTheDocument();
});

test('triggers onShiftOptions on drop', async () => {
  const onShiftOptions = jest.fn();
  render(
    <>
      <OptionWrapper
        index={1}
        clickClose={jest.fn()}
        type={'Column' as DndItemType}
        onShiftOptions={onShiftOptions}
        label="Option 1"
      />
      <OptionWrapper
        index={2}
        clickClose={jest.fn()}
        type={'Column' as DndItemType}
        onShiftOptions={onShiftOptions}
        label="Option 2"
      />
    </>,
    { useDnd: true },
  );

  fireEvent.dragStart(await screen.findByText('Option 1'));
  fireEvent.drop(await screen.findByText('Option 2'));
  expect(onShiftOptions).toHaveBeenCalled();
});
