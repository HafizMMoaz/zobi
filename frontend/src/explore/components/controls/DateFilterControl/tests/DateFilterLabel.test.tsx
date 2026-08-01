import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { render, screen, userEvent } from 'spec/helpers/testing-library';

import { NO_TIME_RANGE } from '@zobi.dev/core';
import DateFilterLabel from '..';
import { DateFilterControlProps } from '../types';
import { DateFilterTestKey } from '../utils';

const mockStore = configureStore([thunk]);

const defaultProps = {
  onChange: jest.fn(),
  onClosePopover: jest.fn(),
  onOpenPopover: jest.fn(),
};

function setup(
  props: Omit<DateFilterControlProps, 'name'> = defaultProps,
  store: any = mockStore({}),
) {
  return (
    <Provider store={store}>
      <DateFilterLabel name="time_range" {...props} />
    </Provider>
  );
}

test('DateFilter with default props', () => {
  render(setup());
  // label
  expect(screen.getByText(NO_TIME_RANGE)).toBeInTheDocument();

  // should be popover by default
  userEvent.click(screen.getByText(NO_TIME_RANGE));
  expect(
    screen.getByTestId(DateFilterTestKey.PopoverOverlay),
  ).toBeInTheDocument();
});

test('DateFilter should be applied the global config time_filter from the store', () => {
  render(
    setup(
      defaultProps,
      mockStore({
        common: { conf: { DEFAULT_TIME_FILTER: 'Last week' } },
      }),
    ),
  );
  // the label should be 'Last week'
  expect(screen.getByText('Last week')).toBeInTheDocument();

  userEvent.click(screen.getByText('Last week'));
  expect(screen.getByTestId(DateFilterTestKey.CommonFrame)).toBeInTheDocument();
});

test('Open and close popover', () => {
  render(setup());

  // click "Cancel"
  userEvent.click(screen.getByText(NO_TIME_RANGE));
  expect(defaultProps.onOpenPopover).toHaveBeenCalled();
  expect(screen.getByText('Edit time range')).toBeInTheDocument();
  userEvent.click(screen.getByText('CANCEL'));
  expect(defaultProps.onClosePopover).toHaveBeenCalled();
  expect(screen.queryByText('Edit time range')).not.toBeInTheDocument();

  // click "Apply"
  userEvent.click(screen.getByText(NO_TIME_RANGE));
  expect(defaultProps.onOpenPopover).toHaveBeenCalled();
  expect(screen.getByText('Edit time range')).toBeInTheDocument();
  userEvent.click(screen.getByText('APPLY'));
  expect(defaultProps.onClosePopover).toHaveBeenCalled();
  expect(screen.queryByText('Edit time range')).not.toBeInTheDocument();
});

test('DateFilter popover should attach to document.body when not overflowing', () => {
  render(setup({ ...defaultProps, isOverflowingFilterBar: false }));

  userEvent.click(screen.getByText(NO_TIME_RANGE));

  const popover = document.querySelector('.time-range-popover');
  expect(popover?.parentElement).toBe(document.body);
});

test('DateFilter popover should attach to parent node when overflowing in filter bar', () => {
  render(setup({ ...defaultProps, isOverflowingFilterBar: true }));

  userEvent.click(screen.getByText(NO_TIME_RANGE));

  const popover = document.querySelector('.time-range-popover');
  const trigger = screen.getByTestId(DateFilterTestKey.PopoverOverlay);

  expect(popover?.parentElement).toBe(trigger.parentElement);
});

test('DateFilter should properly handle isOverflowingFilterBar prop changes', () => {
  const { rerender } = render(
    setup({ ...defaultProps, isOverflowingFilterBar: false }),
  );

  // When not overflowing, popover should attach to document.body
  userEvent.click(screen.getByText(NO_TIME_RANGE));
  const popover = document.querySelector('.time-range-popover');
  expect(popover?.parentElement).toBe(document.body);

  userEvent.click(screen.getByText('CANCEL'));

  // When overflowing, popover should attach to parent node
  rerender(setup({ ...defaultProps, isOverflowingFilterBar: true }));
  userEvent.click(screen.getByText(NO_TIME_RANGE));

  const popoverAfterRerender = document.querySelector('.time-range-popover');
  const trigger = screen.getByTestId(DateFilterTestKey.PopoverOverlay);

  expect(popoverAfterRerender?.parentElement).toBe(trigger.parentElement);
  expect(popoverAfterRerender?.parentElement).not.toBe(document.body);
});
