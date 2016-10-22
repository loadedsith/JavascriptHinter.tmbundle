var fileList = require('./fileList');

/**
 * Load JavascriptHinter plugins
 */
module.exports = {
  /**
   * Get a list of plugins in the pluginPath directory as an array.
   *
   * @param {?String} dir Starting directory to load plugins from
   *     (defaults to './hint-connectors/').
   * @return {Array<Object>} The plugins found in the pluginPath.
   */
  getPlugins: function (pluginPath) {
    var plugins = [];
    var connectorName = 'connector.js';

    if (!pluginPath) {
      pluginPath = './hint-connectors/';
    }

    fileList(pluginPath).forEach(function (filePath) {
      var pluginNameLength = filePath.length - connectorName.length;
      if (filePath.indexOf(connectorName) === pluginNameLength) {
        var plugin = require(filePath);
        plugins.push(plugin);
      }
    });

    return plugins;
  }
};
