
import { render } from '@zobi.dev/core/spec';
import * as ReactCronPicker from 'react-js-cron';
import { CronPicker } from '.';

const spy = jest.spyOn(ReactCronPicker, 'default');

test('Should send correct props to ReactCronPicker', () => {
  const props = {
    myCustomProp: 'myCustomProp',
  };
  render(<CronPicker {...(props as any)} />);
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      className: expect.any(String),
      locale: expect.anything(),
      myCustomProp: 'myCustomProp',
    }),
    expect.anything(),
  );
});
