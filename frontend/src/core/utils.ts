import type { common as core } from '@zobi.dev/extension-api';
import { AnyAction } from 'redux';
import { listenerMiddleware, RootState, store } from 'src/views/store';
import { AnyListenerPredicate } from '@reduxjs/toolkit';

export function createActionListener<V>(
  predicate: AnyListenerPredicate<RootState>,
  listener: (v: V) => void,
  valueParser: (action: AnyAction, state: RootState) => V | null | undefined,
  thisArgs?: any,
): core.Disposable {
  const boundListener = thisArgs ? listener.bind(thisArgs) : listener;

  const unsubscribe = listenerMiddleware.startListening({
    predicate,
    effect: (action: AnyAction) => {
      const state = store.getState();
      const value = valueParser(action, state);
      // Skip calling listener if valueParser returns null/undefined
      if (value != null) {
        boundListener(value);
      }
    },
  });

  return {
    dispose: () => {
      unsubscribe();
    },
  };
}
