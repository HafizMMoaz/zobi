import fs from 'fs';
import path from 'path';
import type { StorybookConfig } from '@storybook/react-webpack5';

const APP_DIR = path.resolve(__dirname, '..');

/**
 * Alias every in-repo workspace package to its `src/`.
 *
 * This mirrors the pass in `webpack.config.js` on purpose: Storybook builds
 * with its own webpack instance and inherits none of the app config. Without
 * it, stories would resolve `@zobi.dev/*` to the stale `lib/`/`esm/` output
 * committed alongside each package and you would be previewing the last build
 * rather than your working tree.
 *
 * Aliases are derived from each `package.json` name rather than assumed from
 * the directory name, so a rename surfaces as a missing alias instead of
 * silently resolving to the wrong copy.
 */
function workspaceAliases(): Record<string, string> {
  const aliases: Record<string, string> = {};

  ['packages', 'plugins'].forEach(group => {
    fs.readdirSync(path.resolve(APP_DIR, group), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .forEach(entry => {
        const pkgDir = path.resolve(APP_DIR, group, entry.name);
        const manifest = path.join(pkgDir, 'package.json');
        const srcDir = path.join(pkgDir, 'src');
        if (!fs.existsSync(manifest) || !fs.existsSync(srcDir)) return;

        const { name } = JSON.parse(fs.readFileSync(manifest, 'utf8'));
        if (!name?.startsWith('@zobi.dev/')) return;

        aliases[name] = srcDir;
      });
  });

  return aliases;
}

/**
 * swc-loader mirroring `createSwcLoader` in `webpack.config.js`.
 *
 * Storybook 8's webpack5 builder ships no compiler of its own - you are
 * expected to add `@storybook/addon-webpack5-compiler-{babel,swc}`. Rather
 * than take a new dependency, this reuses the `swc-loader` the app already
 * compiles with, which also keeps Storybook and the app on one transform.
 *
 * `importSource: '@emotion/react'` is not optional: the whole repo relies on
 * the emotion `css` prop, which only works when JSX is routed through
 * emotion's automatic runtime.
 */
function swcLoader(syntax: 'typescript' | 'ecmascript') {
  return {
    loader: 'swc-loader',
    options: {
      jsc: {
        parser: {
          syntax,
          tsx: syntax === 'typescript',
          jsx: syntax === 'ecmascript',
          dynamicImport: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
            importSource: '@emotion/react',
            development: false,
            refresh: false,
          },
        },
        target: 'es2015',
        loose: true,
      },
    },
  };
}

const config: StorybookConfig = {
  // Restricted to `src/` in each workspace. A bare `packages/**` would also
  // match the built `lib/` and `esm/` copies of every story and show each one
  // three times in the sidebar.
  stories: [
    '../src/**/*.stories.@(ts|tsx|js|jsx)',
    '../packages/*/src/**/*.stories.@(ts|tsx|js|jsx)',
    '../plugins/*/src/**/*.stories.@(ts|tsx|js|jsx)',
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@mihkeleidast/storybook-addon-source',
  ],

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  core: {
    disableTelemetry: true,
  },

  webpackFinal: async cfg => {
    cfg.module = cfg.module ?? {};
    cfg.module.rules = [
      ...(cfg.module.rules ?? []),
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [swcLoader('typescript')],
      },
      {
        test: /\.jsx?$/,
        include: ['src', '.storybook', 'packages', 'plugins'].map(dir =>
          path.resolve(APP_DIR, dir),
        ),
        // Workspace packages vendor their own deps; those are already built.
        exclude: [/(packages|plugins)\/[^/]+\/node_modules\//],
        use: [swcLoader('ecmascript')],
      },
      // Storybook's builder covers the usual asset types (CSS, images, fonts)
      // but not these two, which chart plugins import directly: country-map
      // ships ~200 `.geojson` boundary files, and `.yml` is on the app's
      // resolve.extensions list.
      {
        test: /\.geojson$/,
        type: 'asset/resource',
      },
      {
        test: /\.ya?ml$/,
        loader: 'js-yaml-loader',
      },
    ];

    cfg.resolve = cfg.resolve ?? {};

    cfg.resolve.alias = {
      ...cfg.resolve.alias,
      '@storybook-shared': path.resolve(APP_DIR, '.storybook/shared'),
      ...workspaceAliases(),
      handlebars: 'handlebars/dist/handlebars.js',
      // Stops webpack resolving moment's locale bundle, which nothing here
      // needs and which warns on every build.
      'moment/min/moment-with-locales': false,
    };

    // `zobi_text` is an optional runtime translation bundle that only exists in
    // a deployed install, so `textUtils.ts` requires it defensively. Matches
    // the same suppression in `webpack.config.js`.
    cfg.ignoreWarnings = [
      ...(cfg.ignoreWarnings ?? []),
      { message: /Can't resolve.*zobi_text/ },
    ];

    // App code imports itself absolutely (`import x from 'src/components/...'`),
    // which only resolves because `webpack.config.js` puts APP_DIR on the
    // module search path. tsconfig's `baseUrl: "."` is the TypeScript half of
    // the same convention; this is the bundler half.
    cfg.resolve.modules = Array.from(
      new Set([
        ...(cfg.resolve.modules ?? ['node_modules']),
        APP_DIR,
        path.resolve(APP_DIR, 'packages'),
        path.resolve(APP_DIR, 'plugins'),
      ]),
    );

    cfg.resolve.extensions = Array.from(
      new Set([
        ...(cfg.resolve.extensions ?? []),
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
      ]),
    );

    // Chart plugins pull in node-flavoured transitive deps. These mirror the
    // app's fallbacks; `buffer` in particular is required by the paired-t-test
    // story.
    cfg.resolve.fallback = {
      ...cfg.resolve.fallback,
      buffer: require.resolve('buffer/'),
      fs: false,
      path: false,
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
    };

    return cfg;
  },
};

export default config;
