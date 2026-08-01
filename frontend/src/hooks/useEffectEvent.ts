// TODO: Replace to react-use-event-hook once https://github.com/facebook/react/pull/25881 is released
import useEventCallback from 'use-event-callback';

declare type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

/**
 * Similar to useCallback, with a few subtle differences:
 * @external
 * https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation
 * @example
 * const onStateChanged = useEffectEvent((state: T) => log(['clicked', state]));
 *
 * useEffect(() => {
 *   onStateChanged(state);
 * }, [onStateChanged, state]);
 * // ^ onStateChanged is guaranteed to never change and always be up to date!
 */
export default function useEffectEvent<A extends any[], R>(
  fn: Fn<A, R>,
): Fn<A, R> {
  return useEventCallback(fn);
}
