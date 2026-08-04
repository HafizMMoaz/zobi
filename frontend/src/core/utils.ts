import type { common as core } from '@zobi.dev/extension-api';
import { AnyAction } from 'redux';
import { listenerMiddleware, RootState, store } from 'src/views/store';
import { AnyListenerPredicate } from '@reduxjs/toolkit';

export function createActionListener<V, A extends AnyAction = AnyAction>(
  predicate: AnyListenerPredicate<RootState>,
  listener: (v: V) => void,
  valueParser: (action: A, state: RootState) => V | null | undefined,
  thisArgs?: any,
): core.Disposable {
  const boundListener = thisArgs ? listener.bind(thisArgs) : listener;

  const unsubscribe = listenerMiddleware.startListening({
    predicate,
    effect: (action: AnyAction) => {
      const state = store.getState();
      // `predicate` is what guarantees the action matches `A`; the two are
      // paired by the caller and TypeScript cannot relate them on its own.
      const value = valueParser(action as A, state);
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
