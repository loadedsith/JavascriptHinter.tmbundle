/**
 * JavascriptHinter - jscs connector
 *
 * Runs the installed jscs version with the specified JSON reporter and parses
 * the output into a JS object
 */
let path = require('path');
let getJsonOutput = require('../helpers/getjsonoutput');


/**
 * JavaScriptHinter for TextMate plugin for jscs.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  extensions: ['.js'],
  name: 'jscs',
  /**
   * Process the file using jscs.
   * @param {Array} files Array of files to check with the specified linter
   * @param {Object} options Configuration options for the current linter.
   * @return {Q.Promise} Returns a promise that is resolved when the output is
   *   parsed to a JS object
   */
  process: function(files, options) {
    const reporterDir = path.dirname(__filename);
    const fileDir = path.dirname(files[0]);
    let args = ['--reporter', reporterDir + '/jscs-json-reporter.js'];

    if (options.args) {
      options.args.forEach(function(arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);

    return getJsonOutput('jscs', args, {cwd: fileDir});
  },
};
