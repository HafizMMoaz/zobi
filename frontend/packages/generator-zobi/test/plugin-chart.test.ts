import { dirname, join } from 'path';
// @ts-ignore -- yeoman-test type resolution differs between local and Docker environments
import helpers from 'yeoman-test';
// @ts-ignore -- fs-extra/esm has no type declarations
import { copySync } from 'fs-extra/esm';
import { fileURLToPath } from 'url';
import pluginChartModule from '../generators/plugin-chart';

test('generator-zobi:plugin-chart:creates files', async () => {
  const result = await helpers
    .run(pluginChartModule)
    .onTargetDirectory((dir: string) => {
      // `dir` is the path to the new temporary directory
      const generatorDirname = dirname(fileURLToPath(import.meta.url));
      copySync(
        join(generatorDirname, '../generators/plugin-chart/templates'),
        join(dir, 'unknown/templates'),
      );
    })
    .withPrompts({
      packageName: 'cold-map',
      description: 'Cold Map',
      componentType: 'function',
      chartType: 'regular',
    })
    .withOptions({ skipInstall: true });

  result.assertFile([
    '.gitignore',
    'babel.config.js',
    'jest.config.js',
    'package.json',
    'README.md',
    'src/plugin/buildQuery.ts',
    'src/plugin/controlPanel.ts',
    'src/plugin/index.ts',
    'src/plugin/transformProps.ts',
    'src/ColdMap.tsx',
    'src/index.ts',
    'test/index.test.ts',
    'test/__mocks__/mockExportString.js',
    'test/plugin/buildQuery.test.ts',
    'test/plugin/transformProps.test.ts',
    'types/external.d.ts',
    'src/images/thumbnail.png',
  ]);
});
