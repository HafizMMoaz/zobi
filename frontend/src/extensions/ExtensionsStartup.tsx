import { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-syntax
import * as zobiCore from '@zobi.dev/extension-api';
import { FeatureFlag, isFeatureEnabled } from '@zobi.dev/core';
import {
  authentication,
  core,
  commands,
  editors,
  extensions,
  menus,
  sqlLab,
  views,
} from 'src/core';
import { useSelector } from 'react-redux';
import { RootState } from 'src/views/store';
import ExtensionsLoader from './ExtensionsLoader';

declare global {
  interface Window {
    zobi: {
      authentication: typeof authentication;
      core: typeof core;
      commands: typeof commands;
      editors: typeof editors;
      extensions: typeof extensions;
      menus: typeof menus;
      sqlLab: typeof sqlLab;
      views: typeof views;
    };
  }
}

const ExtensionsStartup: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false);

  const userId = useSelector<RootState, number | undefined>(
    ({ user }) => user.userId,
  );

  useEffect(() => {
    if (initialized) return;

    if (!userId) {
      // No user logged in — nothing to initialize
      setInitialized(true);
      return;
    }

    // Provide the implementations for @zobi.dev/extension-api
    window.zobi = {
      ...zobiCore,
      authentication,
      core,
      commands,
      editors,
      extensions,
      menus,
      sqlLab,
      views,
    };

    const setup = async () => {
      if (isFeatureEnabled(FeatureFlag.EnableExtensions)) {
        await ExtensionsLoader.getInstance().initializeExtensions();
      }
      setInitialized(true);
    };

    setup();
  }, [initialized, userId]);

  if (!initialized) {
    return null;
  }

  return <>{children}</>;
};

export default ExtensionsStartup;
