/**
 * Google Closure Linter - gjslint connector
 * Runs the installed gjslint version with and uses getJsonGJSLintOutput parses
 * the output into a JS object
 */
const path = require('path');
const getJsonGJSLintOutput = require('./getjsongjslintoutput');


/**
 * JavaScriptHinter for TextMate plugin for gjslint.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  extensions: ['.js'],
  name: 'gjslint',
  /**
   * Processes the file using gjslint.
   *
   * @param {Array} files Array of files to check with the specified linter.
   * @param {Object} options Options containing args<Array{string}>
   *     and cwd {string}.
   * @return {Q.Promise} Returns a promise that is resolved when the output is
   * should catch it parsed to a JS object
   *
   */
  process: function(files, options) {
    const fileDir = path.dirname(files[0]);
    let args = [
      '--nobeep',
      '--nosummary',
      '--quiet',
    ];

    if (options.args) {
      options.args.forEach(function(arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);

    return getJsonGJSLintOutput('gjslint', args, {
      cwd: options.cwd || fileDir || '',
    });
  },
};
