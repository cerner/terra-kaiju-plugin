const fs = require('fs');
/* eslint-disable-next-line import/no-extraneous-dependencies */
const chalk = require('chalk');
const config = require('./kaiju.config');
const Generator = require('./Generator');
const { execSync } = require('child_process');

/**
 * The DependencyManager is a script to install and generate a JSON file for new components.
 */
class DependencyManager {
  /**
   * Adds a dependency.
   * @param {string} dependency - The dependency name.
   */
  static add(dependency) {
    if (!dependency) {
      // eslint-disable-next-line no-console
      console.warn(`${chalk.yellow('WARN:')} No dependency specified. Cancelling installation.`);
      process.exit(1);
    }

    DependencyManager.install(dependency);

    // Add the dependency to the config.
    const { dependencies } = config;
    dependencies[dependency] = {};

    // Sort the dependencies.
    const sorted = {};
    Object.keys(dependencies).sort().forEach((item) => {
      sorted[item] = dependencies[item];
    });

    // Write the updated dependencies to the config.
    const updatedConfig = Object.assign({}, config, { dependencies: sorted });
    fs.writeFileSync('./scripts/generator/kaiju.config.json', `${JSON.stringify(updatedConfig, null, 2)}\n`);
  }

  /**
   * Checks if the dependency already exists.
   * @param {string} dependency - The dependency name.
   * @return {boolean} - True if the dependency exists.
   */
  static exists(dependency) {
    const { dependencies } = config;

    return !!dependencies[dependency];
  }

  /**
   * Installs a dependency.
   * @param {string} dependency - The dependency name.
   */
  static install(dependency) {
    if (DependencyManager.exists(dependency)) {
      // eslint-disable-next-line no-console
      console.warn(`${chalk.yellow('WARN:')} [${dependency}] Already exists. Cancelling installation.`);
      process.exit(1);
    }

    execSync(`npm install --save ${dependency}`, { stdio: [0, 1, 2] });
  }
}

DependencyManager.add(process.argv[2]);
Generator.generate(config);
