import { render, screen, fireEvent } from 'spec/helpers/testing-library';
import { CalendarFrame } from '../components/CalendarFrame';
import { PreviousCalendarWeek, PreviousCalendarQuarter } from '../types';
import { CALENDAR_RANGE_OPTIONS } from '../utils/constants';

// eslint-disable-next-line no-restricted-globals -- TODO: Migrate from describe blocks
describe('CalendarFrame', () => {
  test('calls onChange with PreviousCalendarWeek if value is not in CALENDAR_RANGE_SET', () => {
    const mockOnChange = jest.fn();
    render(<CalendarFrame onChange={mockOnChange} value="invalid-value" />);

    expect(mockOnChange).toHaveBeenCalledWith(PreviousCalendarWeek);
  });

  test('renders null if value is not in CALENDAR_RANGE_SET', () => {
    render(<CalendarFrame onChange={jest.fn()} value="invalid-value" />);
    expect(
      screen.queryByText('Configure Time Range: Previous...'),
    ).not.toBeInTheDocument();
  });

  test('renders the correct number of radio options', () => {
    render(<CalendarFrame onChange={jest.fn()} value={PreviousCalendarWeek} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(CALENDAR_RANGE_OPTIONS.length);
    CALENDAR_RANGE_OPTIONS.forEach(option => {
      expect(screen.getByText(option.label as string)).toBeInTheDocument();
    });
  });

  test('calls onChange with the correct value when a radio button is selected', () => {
    const mockOnChange = jest.fn();
    render(
      <CalendarFrame
        onChange={mockOnChange}
        value={CALENDAR_RANGE_OPTIONS[0].value}
      />,
    );

    const secondOption = CALENDAR_RANGE_OPTIONS[1];
    const radio = screen.getByLabelText(secondOption.label as string);
    fireEvent.click(radio);

    expect(mockOnChange).toHaveBeenCalledWith(secondOption.value);
  });

  test('renders the section title correctly', () => {
    render(
      <CalendarFrame
        onChange={jest.fn()}
        value={CALENDAR_RANGE_OPTIONS[0].value}
      />,
    );
    expect(
      screen.getByText('Configure Time Range: Previous...'),
    ).toBeInTheDocument();
  });

  test('ensures the third option is PreviousCalendarQuarter', () => {
    render(
      <CalendarFrame
        onChange={jest.fn()}
        value={CALENDAR_RANGE_OPTIONS[0].value}
      />,
    );

    const thirdOption = CALENDAR_RANGE_OPTIONS[2];
    expect(thirdOption.value).toBe(PreviousCalendarQuarter);

    expect(
      screen.getByLabelText(thirdOption.label as string),
    ).toBeInTheDocument();
  });
});
