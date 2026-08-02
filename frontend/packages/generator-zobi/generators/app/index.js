import chalk from 'chalk';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import yosay from 'yosay';
import Generator from 'yeoman-generator';

export default class extends Generator {
  async prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the ${chalk.red('generator-zobi')} generator!`));

    this.option('skipInstall');
  }

  async configuring() {
    const generatorDirname = dirname(fileURLToPath(import.meta.url));
    await this.composeWith(
      resolve(generatorDirname, `../plugin-chart/index.js`),
    );
  }
}
