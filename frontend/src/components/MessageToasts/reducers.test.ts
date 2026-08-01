import { ADD_TOAST, REMOVE_TOAST } from 'src/components/MessageToasts/actions';
import messageToastsReducer from 'src/components/MessageToasts/reducers';
import { ToastMeta, ToastType } from 'src/components/MessageToasts/types';

// messageToasts reducer
test('messageToasts reducer should return initial state', () => {
  expect(
    messageToastsReducer(undefined, { type: '' } as unknown as Parameters<
      typeof messageToastsReducer
    >[1]),
  ).toEqual([]);
});

test('messageToasts reducer should add a toast', () => {
  expect(
    messageToastsReducer([], {
      type: ADD_TOAST,
      payload: {
        text: 'test',
        id: 'id',
        toastType: ToastType.Info,
        duration: 4000,
      },
    }),
  ).toEqual([
    { text: 'test', id: 'id', toastType: ToastType.Info, duration: 4000 },
  ]);
});

test('messageToasts reducer should remove a toast', () => {
  expect(
    messageToastsReducer(
      [
        { id: 'id', toastType: ToastType.Info, text: 'toast1', duration: 4000 },
        {
          id: 'id2',
          toastType: ToastType.Info,
          text: 'toast2',
          duration: 4000,
        },
      ] as ToastMeta[],
      {
        type: REMOVE_TOAST,
        payload: { id: 'id' },
      },
    ),
  ).toEqual([
    { id: 'id2', toastType: ToastType.Info, text: 'toast2', duration: 4000 },
  ]);
});
