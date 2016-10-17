/**
 * JavascriptHinter - jscs connector
 *
 * Runs the installed jscs version with the specified JSON reporter and parses
 * the output into a JS object
 */
var path = require('path'),
  getJsonOutput = require('../helpers/getjsonoutput');


/**
 * JavaScriptHinter for TextMate plugin for jscs.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  name: 'jscs',
  extensions: ['.js'],
  /**
   * Process the file using jscs
   * @param {Array} files Array of files to check with the specified linter
   * @param {Object} options Configuration options for the current linter.
   * @return {Q.Promise} Returns a promise that is resolved when the output is
   *   parsed to a JS object
   */
  process: function (files, options) {
    var reporterDir = path.dirname(__filename),
      fileDir = path.dirname(files[0]),
      args = ['--reporter', reporterDir + '/jscs-json-reporter.js'];

    if (options.args) {
      options.args.forEach(function (arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);
    return getJsonOutput('jscs', args, {cwd: fileDir});
  }
};
