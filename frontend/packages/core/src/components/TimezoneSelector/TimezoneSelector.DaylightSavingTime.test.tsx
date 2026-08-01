
import { FC } from 'react';
import { render, screen, userEvent } from '@zobi.dev/core/spec';
import '@testing-library/jest-dom';
import type { TimezoneSelectorProps } from './index';

const loadComponent = (mockCurrentTime?: string) => {
  if (mockCurrentTime) {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockCurrentTime));
  }
  return new Promise<FC<TimezoneSelectorProps>>(resolve => {
    const { default: TimezoneSelector } = module.require('./index');
    resolve(TimezoneSelector);
  });
};

afterEach(() => {
  jest.useRealTimers();
});

test('render timezones in correct order for daylight saving time', async () => {
  const TimezoneSelector = await loadComponent('2022-07-01');
  const onTimezoneChange = jest.fn();
  render(
    <TimezoneSelector
      onTimezoneChange={onTimezoneChange}
      timezone="America/Nassau"
    />,
  );

  // Wait for loading to complete by waiting for expected timezone text
  await screen.findByText('GMT -04:00 (Eastern Daylight Time)');

  const searchInput = screen.getByRole('combobox');
  await userEvent.click(searchInput);

  // Wait for options to appear by finding one of the expected timezone texts
  await screen.findByText('GMT -11:00 (Pacific/Midway)');
  const options = document.querySelectorAll('.ant-select-item-option-content');

  // first option is always current timezone
  expect(options[0]).toHaveTextContent('GMT -04:00 (Eastern Daylight Time)');
  expect(options[1]).toHaveTextContent('GMT -11:00 (Pacific/Midway)');
  expect(options[2]).toHaveTextContent('GMT -11:00 (Pacific/Niue)');
  expect(options[3]).toHaveTextContent('GMT -11:00 (Pacific/Pago_Pago)');
});
