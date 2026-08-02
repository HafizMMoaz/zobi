// @ts-ignore -- yeoman-test type resolution differs between local and Docker environments
import helpers, { result } from 'yeoman-test';
import appModule from '../generators/app';

test('generator-zobi:app:creates files', async () => {
  await helpers.run(appModule).withPrompts({
    subgenerator: 'package',
    name: 'my-package',
  });
  result.assertFile([
    'package.json',
    'README.md',
    'src/index.ts',
    'test/index.test.ts',
  ]);
});
