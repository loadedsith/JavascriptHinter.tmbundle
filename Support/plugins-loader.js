
const {put} = require('js-csp');

const fileList = require('./fileList');

/**
 * Load JavascriptHinter plugins
 */
module.exports = {
  /**
   * Gets a list of plugins in the pluginPath directory as an array.
   *
   * @param {string} ch Plugin channel.
   * @param {?string} pluginPath Starting directory to load plugins from
   *     (defaults to './hint-connectors/').
   * @param {Array<string>} disabledPlugins A list of plugin names to not load.
   */
  * getPlugins(ch, pluginPath, disabledPlugins) {
    let connectorName = 'connector.js';

    if (!pluginPath) {
      pluginPath = process.env.PWD + '/hint-connectors/';
    }

    let filePaths = fileList(pluginPath);

    for (let filePath of filePaths) {
      let pluginNameLength = filePath.length - connectorName.length;

      if (filePath.indexOf(connectorName) === pluginNameLength) {
        const plugin = require(pluginPath + filePath);

        if (disabledPlugins.indexOf(plugin.name) === -1) {
          yield put(ch, plugin);
        }
      }
    }
  },
};
