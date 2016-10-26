/**
 * Google Closure Linter - gjslint connector
 * Runs the installed gjslint version with and uses getJsonGJSLintOutput parses
 * the output into a JS object
 */
var path = require('path'),
  getJsonGJSLintOutput = require('./getjsongjslintoutput');


/**
 * JavaScriptHinter for TextMate plugin for gjslint.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  name: 'gjslint',
  extensions: ['.js'],
  /**
   * Process the file using gjslint
   *
   * @param {Array} files Array of files to check with the specified linter
   * @return {Q.Promise} Returns a promise that is resolved when the output is //this line is too long and the linter should catch itthis line is too long and the linter should catch itthis line is too long and the linter should catch it
   *     parsed to a JS object
   *
   */
  process: function (files, options) {
    var fileDir = path.dirname(files[0]);
    var args = [
      '--nobeep', '--nosummary', '--quiet'
    ];

    if (options.args) {
      options.args.forEach(function (arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);
    return getJsonGJSLintOutput('gjslint', args, {
      cwd: options.cwd || fileDir || '',
    });
  },
  debug: 'this line is too long and the linter should catch itthis line is too long and the linter should catch itthis line is too long and the linter should catch it'
};
