/**
 * JavascriptHinter - eslint connector
 *
 * Runs the installed eslint version with the default JSON reporter and parses
 * the output into a JS object.
 */
var path = require('path');
var getJsonOutput = require('../helpers/getjsonoutput');
var Q = require('q');


/**
 * JavaScriptHinter for TextMate plugin for eslint.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  name: 'eslint',
  extensions: ['.js'],
  /**
   * Process the file using eslint
   * @param {Array} files Array of files to check with the specified linter
   * @param {Object} options Configuration options for the current linter.
   * @return {Q.Promise} Returns a promise that is resolved when the output is
   *   parsed to a JS object
   */
  process: function (files, options) {
    var def = Q.defer();
    var fileDir = path.dirname(files[0]);

    var args = ['--format', 'JSON'];

    if (options.args) {
      options.args.forEach(function (arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);
    var originalOutput = getJsonOutput('eslint', args, {cwd: fileDir});

    /**
     * Original JSON output needs to be transformed so it can be used with the
     * default renderer & tooltip
     */
    originalOutput
      .then(function (output) {
        var errors = [];
        var fileErrors = output.map(function (file) {
          return file.messages.map(function (message) {
            return {
              hinttype: 'eslint',
              file: file.filePath,
              line: message.line,
              column: message.column,
              evidence: message.source || '',
              message: message.message +
                  (message.linter ? ' (' + message.linter + ')' : ''),
              rule: file.code
            };
          });
        });

        for (var i = fileErrors.length - 1; i >= 0; i--) {
          for (var ii = fileErrors[i].length - 1; ii >= 0; ii--) {
            errors.push(fileErrors[i][ii]);
          }
        }

        def.resolve(errors);
      }, def.reject)
      .done();
    return def.promise;
  }
};
