import { fireEvent, render, waitFor } from 'spec/helpers/testing-library';

import ToastPresenter from 'src/components/MessageToasts/ToastPresenter';
import { ToastMeta } from 'src/components/MessageToasts/types';
import mockMessageToasts from './mockMessageToasts';

const props = {
  toasts: mockMessageToasts as ToastMeta[],
  removeToast() {},
};

function setup(overrideProps?: Record<string, unknown>) {
  return render(<ToastPresenter {...props} {...overrideProps} />);
}

test('should render a div with id toast-presenter', () => {
  const { container } = setup();
  expect(container.querySelector('#toast-presenter')).toBeInTheDocument();
});

test('should render a Toast for each toast object', () => {
  const { getAllByRole } = setup();
  expect(getAllByRole('alert')).toHaveLength(props.toasts.length);
});

test('should pass removeToast to the Toast component', async () => {
  const removeToast = jest.fn();
  const { getAllByTestId } = setup({ removeToast });
  fireEvent.click(getAllByTestId('close-button')[0]);
  await waitFor(() => expect(removeToast).toHaveBeenCalledTimes(1));
});
