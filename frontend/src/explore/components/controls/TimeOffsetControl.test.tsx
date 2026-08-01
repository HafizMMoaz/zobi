import configureStore from 'redux-mock-store';
import { render, screen } from 'spec/helpers/testing-library';
import { INVALID_DATE } from '@zobi.dev/chart-controls';
import { extendedDayjs } from '@zobi.dev/core/utils/dates';
import TimeOffsetControls, {
  TimeOffsetControlsProps,
} from './TimeOffsetControl';

const mockStore = configureStore([]);

const defaultProps: TimeOffsetControlsProps = {
  onChange: jest.fn(),
};

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('TimeOffsetControls', () => {
  const setup = (initialState = {}) => {
    const store = mockStore({
      explore: {
        form_data: {
          adhoc_filters: [
            {
              operator: 'TEMPORAL_RANGE',
              subject: 'date',
              comparator: '2023-01-01 : 2023-12-31',
            },
          ],
          start_date_offset: '2023-01-01',
          ...initialState,
        },
      },
    });

    const props = { ...defaultProps };

    render(<TimeOffsetControls {...props} />, { store });

    return { store, props };
  };

  test('TimeOffsetControl renders DatePicker when startDate is set', () => {
    setup();
    const datePickerInput = screen.getByRole('textbox');
    expect(datePickerInput).toBeInTheDocument();
    expect(datePickerInput).toHaveValue('2023-01-01');
  });

  // Our Time comparison control depends on this string for supporting date deletion on date picker
  // That's why this test is linked to the TimeOffsetControl component
  test('Dayjs should return "Invalid date" when parsing an invalid date string', () => {
    const invalidDate = extendedDayjs('not-a-date');
    expect(invalidDate.format()).toBe(INVALID_DATE);
  });
});
