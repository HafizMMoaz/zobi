import 'src/public-path';

// Accept HMR updates for this entry point
declare const module: { hot?: { accept: () => void } };
if (module.hot) {
  module.hot.accept();
}
