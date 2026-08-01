
/**
 * @fileoverview Standalone views registry implementation.
 *
 * Stores view metadata and providers as module-level state.
 * Extensions register views as side effects at import time.
 */

import React, { ReactElement } from 'react';
import type { views as viewsApi } from '@zobi/core';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import ExtensionPlaceholder from 'src/extensions/ExtensionPlaceholder';
import { Disposable } from '../models';

type View = viewsApi.View;

const viewRegistry: Map<
  string,
  { view: View; location: string; provider: () => ReactElement }
> = new Map();

const locationIndex: Map<string, Set<string>> = new Map();

const registerView: typeof viewsApi.registerView = (
  view: View,
  location: string,
  provider: () => ReactElement,
): Disposable => {
  const { id } = view;

  viewRegistry.set(id, { view, location, provider });

  const ids = locationIndex.get(location) ?? new Set();
  ids.add(id);
  locationIndex.set(location, ids);

  return new Disposable(() => {
    viewRegistry.delete(id);
    locationIndex.get(location)?.delete(id);
  });
};

export const resolveView = (id: string): ReactElement => {
  const provider = viewRegistry.get(id)?.provider;
  if (!provider) {
    return React.createElement(ExtensionPlaceholder, { id });
  }
  return React.createElement(ErrorBoundary, null, provider());
};

const getViews: typeof viewsApi.getViews = (
  location: string,
): View[] | undefined => {
  const ids = locationIndex.get(location);
  if (!ids || ids.size === 0) return undefined;

  return Array.from(ids)
    .map(id => viewRegistry.get(id)?.view)
    .filter((c): c is View => !!c);
};

export const views: typeof viewsApi = {
  registerView,
  getViews,
};
