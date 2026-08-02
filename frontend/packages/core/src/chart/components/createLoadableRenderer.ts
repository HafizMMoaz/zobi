import { ReactElement, useEffect, useRef, useState } from 'react';

export type LoadableRendererProps = {
  onRenderFailure?: (error: Error) => void;
  onRenderSuccess?: () => void;
};

type LoaderMap<Exports> = {
  [K in keyof Exports]: () => Promise<Exports[K]> | Exports[K];
};

export interface LoadingProps {
  error?: { toString(): string };
}

export interface LoadableOptions<Props, Exports> {
  loader: LoaderMap<Exports>;
  loading: (loadingProps: LoadingProps) => ReactElement | null;
  render: (loaded: Exports, props: Props) => ReactElement;
}

export interface LoadableRenderer<Props> {
  (props: Props & LoadableRendererProps): ReactElement | null;
  preload: () => Promise<unknown>;
  displayName?: string;
}

export default function createLoadableRenderer<Props, Exports>(
  options: LoadableOptions<Props, Exports>,
): LoadableRenderer<Props> {
  let promise: Promise<Exports> | null = null;
  let cachedResult: Exports | null = null;
  let cachedError: Error | null = null;

  const load = (): Promise<Exports> => {
    if (promise) return promise;
    const keys = Object.keys(options.loader) as (keyof Exports)[];
    promise = Promise.all(
      keys.map(key => Promise.resolve(options.loader[key]())),
    ).then(
      values => {
        const loaded = {} as Exports;
        keys.forEach((key, i) => {
          loaded[key] = values[i] as Exports[typeof key];
        });
        cachedResult = loaded;
        return loaded;
      },
      err => {
        cachedError = err instanceof Error ? err : new Error(String(err));
        throw cachedError;
      },
    );
    return promise;
  };

  const Renderer: LoadableRenderer<Props> = props => {
    const [state, setState] = useState<{
      loaded: Exports | null;
      error: Error | null;
    }>(() => ({ loaded: cachedResult, error: cachedError }));

    useEffect(() => {
      if (state.loaded || state.error) return undefined;
      let cancelled = false;
      load().then(
        loaded => {
          if (!cancelled) setState({ loaded, error: null });
        },
        err => {
          if (!cancelled) setState({ loaded: null, error: err });
        },
      );
      return () => {
        cancelled = true;
      };
    }, [state.loaded, state.error]);

    // Keep callback refs current without retriggering the post-load effect on
    // every prop update.
    const onRenderSuccessRef = useRef(props.onRenderSuccess);
    const onRenderFailureRef = useRef(props.onRenderFailure);
    onRenderSuccessRef.current = props.onRenderSuccess;
    onRenderFailureRef.current = props.onRenderFailure;

    useEffect(() => {
      if (state.error) {
        onRenderFailureRef.current?.(state.error);
      } else if (state.loaded && Object.keys(state.loaded).length > 0) {
        onRenderSuccessRef.current?.();
      }
    }, [state.loaded, state.error]);

    if (state.error) {
      return options.loading({ error: state.error });
    }
    if (!state.loaded) {
      return options.loading({});
    }
    return options.render(state.loaded, props as Props);
  };

  Renderer.preload = load;

  return Renderer;
}
