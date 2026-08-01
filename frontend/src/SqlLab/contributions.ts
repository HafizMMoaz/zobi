/**
 * View locations for SQL Lab extension integration.
 *
 * These define the locations where extensions can contribute views and menus.
 * The nested structure mirrors the extension.json contribution schema.
 *
 * @example
 * // In extension.json:
 * {
 *   "contributions": {
 *     "views": {
 *       "sqllab": {
 *         "panels": [{ "id": "my-ext.panel", "name": "My Panel" }]
 *       }
 *     }
 *   }
 * }
 *
 * // In component code:
 * <ViewListExtension viewId={ViewLocations.sqllab.panels} />
 */
export const ViewLocations = {
  sqllab: {
    leftSidebar: 'sqllab.leftSidebar',
    rightSidebar: 'sqllab.rightSidebar',
    panels: 'sqllab.panels',
    editor: 'sqllab.editor',
    statusBar: 'sqllab.statusBar',
    results: 'sqllab.results',
    queryHistory: 'sqllab.queryHistory',
  },
} as const;
