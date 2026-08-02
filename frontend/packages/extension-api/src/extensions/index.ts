/**
 * @fileoverview Extensions API for Zobi extension management.
 *
 * This module provides functions and events for managing Zobi extensions,
 * including querying extension metadata and monitoring extension lifecycle events.
 * Extensions can use this API to discover other extensions and react to changes
 * in the extension ecosystem.
 */

import { Extension } from '../common';

/**
 * Get an extension by its full identifier in the form of: `publisher.name`.
 * This function allows extensions to discover and interact with other extensions
 * in the Zobi ecosystem.
 *
 * @param extensionId An extension identifier in the format "publisher.name".
 * @returns The extension object if found, or `undefined` if no extension matches the identifier.
 *
 * @example
 * ```typescript
 * const chartExtension = getExtension('zobi.chart-plugins');
 * if (chartExtension) {
 *   console.log('Chart extension is available:', chartExtension.displayName);
 * } else {
 *   console.log('Chart extension not found');
 * }
 * ```
 */
export declare function getExtension(
  extensionId: string,
): Extension | undefined;

/**
 * Get all extensions currently known to the system.
 * This function returns a readonly array containing all extensions that are installed
 * and available, regardless of their activation status.
 *
 * @returns A readonly array of all extension objects in the system.
 *
 * @example
 * ```typescript
 * const extensions = getAllExtensions();
 * console.log(`Total extensions: ${extensions.length}`);
 * extensions.forEach(ext => {
 *   console.log(`- ${ext.id}: ${ext.name} (enabled: ${ext.enabled})`);
 * });
 * ```
 */
export declare function getAllExtensions(): readonly Extension[];
