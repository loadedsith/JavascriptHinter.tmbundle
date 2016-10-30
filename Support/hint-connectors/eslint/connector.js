/**
 * JavascriptHinter - eslint connector
 *
 * Runs the installed eslint version with the default JSON reporter and parses
 * the output into a JS object.
 */
const path = require('path');
const getJsonOutput = require('../helpers/getjsonoutput');
const Q = require('q');


/**
 * JavaScriptHinter for TextMate plugin for eslint.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  extensions: ['.js'],
  name: 'eslint',
  /**
   * Process the file using eslint.
   * @param {Array} files Array of files to check with the specified linter
   * @param {Object} options Configuration options for the current linter.
   * @return {Q.Promise} Returns a promise that is resolved when the output is
   *   parsed to a JS object
   */
  process: function(files, options) {
    let def = Q.defer();
    let fileDir = path.dirname(files[0]);
    let args = ['--format', 'JSON'];

    if (options.args) {
      options.args.forEach(function(arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);
    let originalOutput = getJsonOutput('eslint', args, {cwd: fileDir});

    /**
     * Original JSON output needs to be transformed so it can be used with the
     * default renderer & tooltip
     */
    originalOutput
      .then(function(output) {
        let errors = [];
        let fileErrors = output.map(function(file) {
          return file.messages.map(function(message) {
            return {
              column: message.column,
              evidence: message.source || '',
              file: file.filePath,
              hinttype: 'eslint',
              line: message.line,
              message: message.message +
                  (message.linter ? ' (' + message.linter + ')' : ''),
              rule: file.code,
            };
          });
        });

        for (let fileError of fileErrors) {
          for (let error of fileError) {
            errors.push(error);
          }
        }

        def.resolve(errors);
      }, def.reject)
      .done();

    return def.promise;
  },
};
