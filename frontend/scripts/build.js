#!/bin/env node



/* eslint-disable no-console */
/**
 * Build packages/plugins filtered by globs
 */
process.env.PATH = `./node_modules/.bin:${process.env.PATH}`;

const { spawnSync } = require('child_process');
const fastGlob = require('fast-glob');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const { globs } = yargs(hideBin(process.argv)).parse();
const glob = globs?.length > 1 ? `{${globs.join(',')}}` : globs?.[0] || '*';

const BABEL_CONFIG = '--config-file=../../babel.config.js';

// packages that do not need tsc
const META_PACKAGES = new Set(['demo', 'generator-zobi']);

function run(cmd, options) {
  console.log(`\n>> ${cmd}\n`);
  const [p, ...args] = cmd.split(' ');
  const runner = spawnSync;
  const { status } = runner(p, args, { stdio: 'inherit', ...options });
  if (status !== 0) {
    process.exit(status);
  }
}

function getPackages(packagePattern, tsOnly = false) {
  let pattern = packagePattern;
  if (pattern === '*' && !tsOnly) {
    return `{@zobi-ui/!(${[...META_PACKAGES].join('|')}),@zobi/*}`;
  }
  if (!pattern.includes('*')) {
    pattern = `*${pattern}`;
  }

  // Find packages in both @zobi-ui and @zobi scopes
  const zobiUiPackages = [
    ...new Set(
      fastGlob
        .sync([
          `./node_modules/@zobi-ui/${pattern}/src/**/*.${
            tsOnly ? '{ts,tsx}' : '{ts,tsx,js,jsx}'
          }`,
        ])
        .map(x => x.split('/')[3])
        .filter(x => !META_PACKAGES.has(x)),
    ),
  ];

  const zobiPackages = [
    ...new Set(
      fastGlob
        .sync([
          `./node_modules/@zobi/${pattern}/src/**/*.${
            tsOnly ? '{ts,tsx}' : '{ts,tsx,js,jsx}'
          }`,
        ])
        .map(x => x.split('/')[3]),
    ),
  ];

  const allScopes = [];
  if (zobiUiPackages.length > 0) {
    allScopes.push(
      `@zobi-ui/${
        zobiUiPackages.length > 1
          ? `{${zobiUiPackages.join(',')}}`
          : zobiUiPackages[0]
      }`,
    );
  }
  if (zobiPackages.length > 0) {
    allScopes.push(
      `@zobi/${
        zobiPackages.length > 1
          ? `{${zobiPackages.join(',')}}`
          : zobiPackages[0]
      }`,
    );
  }

  if (allScopes.length === 0) {
    throw new Error('No matching packages');
  }

  return allScopes.length > 1 ? `{${allScopes.join(',')}}` : allScopes[0];
}

let scope = getPackages(glob);

console.log('--- Run babel --------');
const babelCommand = `lerna exec --stream --concurrency 10 --scope ${scope}
        -- babel ${BABEL_CONFIG} src --extensions ".ts,.tsx,.js,.jsx" --copy-files`;
run(`${babelCommand} --out-dir lib`);

console.log('--- Run babel esm ---');
// run again with
run(`${babelCommand} --out-dir esm`, {
  env: { ...process.env, NODE_ENV: 'production', BABEL_OUTPUT: 'esm' },
});

console.log('--- Run tsc ---');
// only run tsc for packages with ts files
scope = getPackages(glob, true);
run(`lerna exec --stream --concurrency 3 --scope ${scope} \
      -- ../../scripts/tsc.sh --build`);
