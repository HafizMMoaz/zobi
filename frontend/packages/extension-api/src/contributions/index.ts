/**
 * @fileoverview Manifest schema for Zobi extension contributions.
 *
 * This module defines the aggregate interfaces used by the extension.json
 * manifest and the `zobi-extensions` build command. Individual metadata
 * types are defined in their respective namespace modules (commands, views,
 * menus, editors) and re-exported here for the manifest schema.
 */

import { Command } from '../commands';
import { View } from '../views';
import { Menu } from '../menus';
import { Editor } from '../editors';

/**
 * Valid locations within SQL Lab.
 */
export type SqlLabLocation =
  | 'leftSidebar'
  | 'rightSidebar'
  | 'panels'
  | 'editor'
  | 'statusBar'
  | 'results'
  | 'queryHistory';

/**
 * Nested structure for view contributions by scope and location.
 * @example
 * {
 *   sqllab: {
 *     panels: [{ id: "my-ext.panel", name: "My Panel" }],
 *     leftSidebar: [{ id: "my-ext.sidebar", name: "My Sidebar" }]
 *   }
 * }
 */
export interface ViewContributions {
  sqllab?: Partial<Record<SqlLabLocation, View[]>>;
}

/**
 * Nested structure for menu contributions by scope and location.
 * @example
 * {
 *   sqllab: {
 *     editor: { primary: [...], secondary: [...] }
 *   }
 * }
 */
export interface MenuContributions {
  sqllab?: Partial<Record<SqlLabLocation, Menu>>;
}

/**
 * Aggregates all contributions (commands, menus, views, and editors) provided by an extension or module.
 */
export interface Contributions {
  /** List of commands. */
  commands: Command[];
  /** Nested mapping of menu contributions by scope and location. */
  menus: MenuContributions;
  /** Nested mapping of view contributions by scope and location. */
  views: ViewContributions;
  /** List of editors. */
  editors?: Editor[];
}
