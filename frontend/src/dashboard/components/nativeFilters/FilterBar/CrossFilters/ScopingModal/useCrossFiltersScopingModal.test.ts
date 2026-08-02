import { ReactElement } from 'react';
import { renderHook, act } from '@testing-library/react';
import { createWrapper, render } from 'spec/helpers/testing-library';
import { useCrossFiltersScopingModal } from './useCrossFiltersScopingModal';

test('Renders modal after calling method open', async () => {
  const { result } = renderHook(() => useCrossFiltersScopingModal(), {
    wrapper: createWrapper({
      initialState: {
        dashboardLayout: {
          present: {},
          past: [],
          future: [],
        },
      },
    }),
  });

  const [openModal, Modal] = result.current;
  expect(Modal).toBeNull();

  act(() => {
    openModal();
  });

  const { getByText } = render(result.current[1] as ReactElement, {
    useRedux: true,
    initialState: {
      dashboardLayout: {
        present: {},
        past: [],
        future: [],
      },
    },
  });

  expect(getByText('Cross-filtering scoping')).toBeInTheDocument();
});
