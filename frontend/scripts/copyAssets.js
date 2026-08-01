#!/usr/bin/env node



/* eslint-disable no-console */
const { sync } = require('fast-glob');
const { copy } = require('fs-extra');

const pkgGlob = process.argv[2] || '*';

const packages = sync([`{packages,plugins}/${pkgGlob}`], {
  onlyDirectories: true,
});

console.log('Copying asset files from package {src} to {lib,esm}...');
packages.forEach(pkg => {
  const assets = sync([`${pkg}/src/**/*.{png,gif,jpg,css,geojson}`]);
  assets.forEach(filePath => {
    ['lib', 'esm']
      .map(dir => filePath.replace(`${pkg}/src`, `${pkg}/${dir}`))
      .forEach(newFilePath => {
        copy(filePath, newFilePath, err => {
          if (err) {
            console.error(err);
          }
        });
      });
  });
  if (assets.length > 0) {
    console.log(
      `  Copied ${assets.length
        .toString()
        .padStart(2)} asset files for ${pkg.replace(
        'packages/zobi-ui-',
        '',
      )}`,
    );
  }
});
