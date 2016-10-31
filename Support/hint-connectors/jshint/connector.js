/**
 * JavascriptHinter - jshint connector
 *
 * Runs the installed jshint version with the specified JSON reporter and parses
 * the output into a JS object
 */
const path = require('path');
const getJsonOutput = require('../helpers/getjsonoutput');


/**
 * Connects jshint to the JavaScriptHinter for TextMate plugin.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  extensions: ['.js'],
  name: 'jshint',
  /**
   * Processes files using jshint.
   * @param {Array} files Array of files to check with the specified linter
   * @param {Object} options Configuration options for the current linter.
   * @return {Q.Promise} Returns a promise that is resolved when the output
   *   is parsed to a JS object
   */
  process: function(files, options) {
    const reporterDir = path.dirname(__filename);
    const fileDir = path.dirname(files[0]);
    let args = ['--reporter', reporterDir + '/jshint-json-reporter.js'];

    if (options.args) {
      options.args.forEach(function(arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);

    return getJsonOutput('jshint', args, {cwd: fileDir});
  },
};
