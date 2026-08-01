
/**
 * @fileoverview Core types and utilities for Zobi extensions.
 *
 * This module provides fundamental types and interfaces used throughout the
 * Zobi extension API. It includes database metadata types, event handling,
 * resource management, and extension lifecycle definitions.
 */

/**
 * Represents a database column with its name and data type.
 */
export type Column = {
  /**
   * Label of the column
   */
  name: string;

  /**
   * Column name defined
   */
  column_name: string;

  /**
   * The data type of the column (e.g., 'INTEGER', 'VARCHAR', 'TIMESTAMP')
   */
  type: string;

  /**
   * Generic data type format
   */
  type_generic: GenericDataType;

  /**
   * True if the column is date format
   */
  is_dttm: boolean;
};

/**
 * Represents a database table with its name and column definitions.
 */
export declare interface Table {
  /** The name of the table */
  name: string;
  /** Array of columns in this table */
  columns: Column[];
}

/**
 * Represents a database catalog.
 * @todo This interface needs to be expanded with catalog-specific properties.
 */
export declare interface Catalog {}

/**
 * Represents a database schema containing tables.
 */
export declare interface Schema {
  /** Array of tables in this schema */
  tables: Table[];
}

/**
 * Represents a database connection with its metadata.
 */
export declare interface Database {
  /** Unique identifier for the database */
  id: number;
  /** Display name of the database */
  name: string;
  /** Array of catalogs available in this database */
  catalogs: Catalog[];
  /** Array of schemas available in this database */
  schemas: Schema[];
}

// Keep in sync with zobi/errors.py
export type ErrorLevel = 'info' | 'warning' | 'error';

/**
 * Zobi error object structure.
 * Contains details about an error that occurred within Zobi.
 */
export type ZobiError = {
  /**
   * Error types, see enum of ZobiErrorType in zobi/errors.py
   */
  error_type: string;

  /**
   * Extra properties based on the error types
   */
  extra: Record<string, any>;

  /**
   * Level of the error type
   */
  level: ErrorLevel;

  /**
   * Detail description for the error
   */
  message: string;
};

/**
 * Generic data types, see enum of the same name in zobi/utils/core.py.
 */
export enum GenericDataType {
  Numeric = 0,
  String = 1,
  Temporal = 2,
  Boolean = 3,
}

/**
 * Represents a type which can release resources, such
 * as event listening or a timer.
 */
export declare class Disposable {
  /**
   * Combine many disposable-likes into one. You can use this method when having objects with
   * a dispose function which aren't instances of `Disposable`.
   *
   * @param disposableLikes Objects that have at least a `dispose`-function member. Note that asynchronous
   * dispose-functions aren't awaited.
   * @returns Returns a new disposable which, upon dispose, will
   * dispose all provided disposables.
   */
  static from(
    ...disposableLikes: {
      /**
       * Function to clean up resources.
       */
      dispose: () => any;
    }[]
  ): Disposable;

  /**
   * Creates a new disposable that calls the provided function
   * on dispose.
   *
   * *Note* that an asynchronous function is not awaited.
   *
   * @param callOnDispose Function that disposes something.
   */
  constructor(callOnDispose: () => any);

  /**
   * Dispose this object.
   */
  dispose(): any;
}

/**
 * Represents a typed event system for handling asynchronous notifications.
 *
 * A function that represents an event to which you subscribe by calling it with
 * a listener function as argument. This provides a type-safe way to handle
 * events throughout the Zobi extension system.
 *
 * @template T The type of data that will be passed to event listeners.
 *
 * @example
 * ```typescript
 * // Subscribe to an event
 * const disposable = myEvent((data) => {
 *   console.log("Event happened:", data);
 * });
 *
 * // Unsubscribe when done
 * disposable.dispose();
 * ```
 */
export declare interface Event<T> {
  /**
   * Subscribe to this event by providing a listener function.
   *
   * @param listener The listener function that will be called when the event is fired.
   *   The function receives the event data as its parameter.
   * @param thisArgs Optional `this` context that will be used when calling the event listener.
   * @returns A Disposable object that can be used to unsubscribe from the event.
   *
   * @example
   * ```typescript
   * const subscription = onSomeEvent((data) => {
   *   console.log('Received:', data);
   * });
   *
   * // Later, clean up the subscription
   * subscription.dispose();
   * ```
   */
  (listener: (e: T) => any, thisArgs?: any): Disposable;
}

/**
 * Represents a Zobi extension with its metadata.
 * Extensions are modular components that can extend Zobi's functionality
 * by registering commands, views, menus, and editors as module-level side effects.
 */
export interface Extension {
  /** List of other extensions that this extension depends on */
  dependencies: string[];
  /** Human-readable description of the extension */
  description: string;
  /** List of other extensions that this extension depends on */
  extensionDependencies: string[];
  /** Unique identifier for the extension */
  id: string;
  /** Human-readable name of the extension */
  name: string;
  /** URL or path to the extension's remote entry point */
  remoteEntry: string;
  /** Version of the extension */
  version: string;
}
