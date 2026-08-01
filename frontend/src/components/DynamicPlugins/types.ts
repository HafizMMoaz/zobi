import type { ChartMetadata } from '@zobi-ui/core';

export type PluginContextType = {
  loading: boolean;
  /** These are actually only the dynamic plugins */
  dynamicPlugins: {
    [key: string]: {
      key: string;
      mounting: boolean;
      error: null | Error;
    };
  };
  keys: string[];
  /** Mounted means the plugin's js bundle has been imported */
  mountedPluginMetadata: Record<string, ChartMetadata>;
  fetchAll: () => void;
};

// the plugin returned from the API
export type Plugin = {
  name: string;
  key: string;
  bundle_url: string;
  id: number;
};

// when a plugin completes loading
export type CompleteAction = {
  type: 'complete';
  key: string;
  error: null | Error;
};

// when plugins start loading
export type BeginAction = {
  type: 'begin';
  keys: string[];
};

export type ChangedKeysAction = {
  type: 'changed keys';
};

export type PluginAction = BeginAction | CompleteAction | ChangedKeysAction;
