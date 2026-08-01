import React, { useEffect, useState, forwardRef, ComponentType } from 'react';

import { Loading } from '../Loading';
import type { PlaceholderProps } from './types';

function DefaultPlaceholder({
  width,
  height,
  showLoadingForImport = true,
  placeholderStyle: style,
}: PlaceholderProps) {
  if (showLoadingForImport) {
    return (
      <div key="async-asm-placeholder" style={{ width, height, ...style }}>
        <Loading position="floating" size="s" />
      </div>
    );
  }
  if (height) {
    return (
      <div key="async-asm-placeholder" style={{ width, height, ...style }} />
    );
  }
  return null;
}

/**
 * Asynchronously import an ES module as a React component, render a placeholder
 * first (if provided) and re-render once import is complete.
 */
export function AsyncEsmComponent<
  P = PlaceholderProps,
  M = ComponentType<P> | { default: ComponentType<P> },
>(
  /**
   * A promise generator that returns the React component to render.
   */
  loadComponent: Promise<M> | (() => Promise<M>),
  /**
   * Placeholder while still importing.
   */
  placeholder: ComponentType<
    PlaceholderProps & Partial<P>
  > | null = DefaultPlaceholder,
) {
  // component props + placeholder props
  type FullProps = P & PlaceholderProps;
  let promise: Promise<M> | undefined;
  let component: ComponentType<FullProps>;

  /**
   * Safely wait for promise, make sure the loader function only execute once.
   */
  function waitForPromise() {
    if (!promise) {
      // load component on initialization
      promise =
        loadComponent instanceof Promise ? loadComponent : loadComponent();
    }
    if (!component) {
      promise.then(result => {
        component = ((result as { default?: ComponentType<P> }).default ||
          result) as ComponentType<FullProps>;
      });
    }
    return promise;
  }

  type AsyncComponent = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<FullProps> & React.RefAttributes<unknown>
  > & {
    preload?: typeof waitForPromise;
  };

  // @ts-expect-error -- generic forwardRef has PropsWithoutRef incompatibility with FullProps
  const AsyncComponent: AsyncComponent = forwardRef(function AsyncComponent(
    props: FullProps,
    ref,
  ) {
    const [loaded, setLoaded] = useState(component !== undefined);
    useEffect(() => {
      let isMounted = true;
      if (!loaded) {
        // update state to trigger a re-render
        waitForPromise().then(() => {
          if (isMounted) {
            setLoaded(true);
          }
        });
      }
      return () => {
        isMounted = false;
      };
    });
    const Component = component || placeholder;
    return Component ? (
      // placeholder does not get the ref
      // @ts-expect-error: Suppress TypeScript error for ref assignment
      <Component ref={Component === component ? ref : null} {...props} />
    ) : null;
  });
  // preload the async component before rendering
  AsyncComponent.preload = waitForPromise;

  return AsyncComponent as AsyncComponent & {
    preload: typeof waitForPromise;
  };
}

export type { PlaceholderProps };
