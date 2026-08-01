import 'src/public-path';

import { createRoot } from 'react-dom/client';
import { logging } from '@zobi.dev/extension-api/utils';
import initPreamble from 'src/preamble';

const appMountPoint = document.getElementById('app');

if (appMountPoint) {
  const root = createRoot(appMountPoint);
  (async () => {
    try {
      await initPreamble();
    } finally {
      const { default: App } = await import(/* webpackMode: "eager" */ './App');
      root.render(<App />);
    }
  })().catch(err => {
    logging.error('Unhandled error during app initialization', err);
  });
}
