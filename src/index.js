/**
 * Underpost index npm package
 * @module src/index.js
 * @namespace Underpost
 */

import { loggerFactory, setUpInfo } from './server/logger.js';

const logger = loggerFactory(import.meta);

/**
 * Underpost main module methods
 * @class
 * @memberof Underpost
 */
class Underpost {
  constructor() {}

  /**
   * Logs information about the current process environment to the console.
   *
   * This function is used to log details about
   * the execution context, such as command-line arguments,
   * environment variables, the process's administrative privileges,
   * and the maximum available heap space size.
   *
   * @static
   * @method setUpInfo
   * @returns {Promise<void>}
   * @memberof Underpost
   */
  static async setUpInfo() {
    return await setUpInfo(logger);
  }
}

const up = Underpost;

const underpost = Underpost;

export { underpost, up, Underpost };

export default Underpost;