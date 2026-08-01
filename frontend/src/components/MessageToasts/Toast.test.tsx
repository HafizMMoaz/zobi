import { fireEvent, render, waitFor } from 'spec/helpers/testing-library';
import Toast from 'src/components/MessageToasts/Toast';
import { ToastMeta } from 'src/components/MessageToasts/types';
import mockMessageToasts from './mockMessageToasts';

const props = {
  toast: mockMessageToasts[0] as ToastMeta,
  onCloseToast() {},
};

const setup = (overrideProps?: Record<string, unknown>) =>
  render(<Toast {...props} {...overrideProps} />);

test('should render', () => {
  const { getByTestId } = setup();
  expect(getByTestId('toast-container')).toBeInTheDocument();
});

test('should render toastText within the div', () => {
  const { getByTestId } = setup();
  expect(getByTestId('toast-container')).toHaveTextContent(props.toast.text);
});

test('should call onCloseToast upon toast dismissal', async () => {
  const onCloseToast = jest.fn();
  const { getByTestId } = setup({ onCloseToast });
  fireEvent.click(getByTestId('close-button'));
  await waitFor(() => expect(onCloseToast).toHaveBeenCalledTimes(1));
  expect(onCloseToast).toHaveBeenCalledWith(props.toast.id);
});
