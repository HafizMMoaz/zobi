/**
 * @fileoverview Views registration API for Zobi extensions.
 *
 * This module provides functions for registering custom React views
 * at specific locations in the Zobi UI. Views are registered as
 * module-level side effects at import time.
 *
 * @example
 * ```typescript
 * import { views } from '@zobi.dev/extension-api';
 *
 * views.registerView(
 *   { id: 'my_ext.result_stats', name: 'Result Stats', location: 'sqllab.panels' },
 *   () => <ResultStatsPanel />,
 * );
 * ```
 */

import { ReactElement } from 'react';
import { Disposable } from '../common';

/**
 * Represents a contributed view in the application.
 */
export interface View {
  /** The unique identifier for the view. */
  id: string;
  /** The display name of the view. */
  name: string;
  /** Optional description of the view, for display in contribution manifests. */
  description?: string;
}

/**
 * Registers a custom view at a specific UI location.
 *
 * The view provider function is called when the UI renders the location,
 * and should return a React element to display.
 *
 * @param view The view descriptor (id and name).
 * @param location The location where this view should appear (e.g. "sqllab.panels").
 * @param provider A function that returns the React element to render.
 * @returns A Disposable that unregisters the view when disposed.
 *
 * @example
 * ```typescript
 * views.registerView(
 *   { id: 'my_ext.result_stats', name: 'Result Stats' },
 *   'sqllab.panels',
 *   () => <ResultStatsPanel />,
 * );
 * ```
 */
export declare function registerView(
  view: View,
  location: string,
  provider: () => ReactElement,
): Disposable;

/**
 * Retrieves all views registered at a specific location.
 *
 * @param location The location to retrieve registered views for (e.g. "sqllab.panels").
 * @returns An array of View objects, or undefined if none are registered.
 *
 * @example
 * ```typescript
 * const panelViews = views.getViews('sqllab.panels');
 * ```
 */
export declare function getViews(location: string): View[] | undefined;
