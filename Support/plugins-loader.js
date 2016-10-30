var csp = require('js-csp');

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
   */
  * getPlugins (ch, pluginPath, disabledPlugins) {
    var plugins = [];
    var connectorName = 'connector.js';

    if (!pluginPath) {
      pluginPath = process.env.PWD + '/hint-connectors/';
    }

    var filePaths = fileList(pluginPath);

    for (var i = 0; i < filePaths.length; i++) {
      var filePath = filePaths[i];
      var pluginNameLength = filePath.length - connectorName.length;
      if (filePath.indexOf(connectorName) === pluginNameLength) {
        var plugin = require(pluginPath + filePath);
        if (disabledPlugins.indexOf(plugin.name) === -1) {
          yield csp.put(ch, plugin);
        }
      }
    }
  }
};
