/**
 * JavascriptHinter - scss-lint connector
 *
 * Runs the installed scss-lint version with the default JSON reporter and
 * parses the output into a JS object.
 */
var path = require('path'),
  getJsonOutput = require('../helpers/getjsonoutput'),
  Q = require('q');

/**
 * JavaScriptHinter for TextMate plugin for scss-lint.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  name: 'scsslint',
  extensions: ['.scss'],
  /**
   * Process the file using scss-lint
   * @param {Array} files Array of files to check with the specified linter
   * @param {Object} options Configuration options for the current linter.
   * @return {Q.Promise} Returns a promise that is resolved when the output is
   * parsed to a JS object.
   */
  process: function (files, options) {
    var def = Q.defer(),
      cwd = path.dirname(files[0]),
      args = ['--format', 'JSON'];

    if (process.env.TM_PROJECT_DIRECTORY) {
      cwd = process.env.TM_PROJECT_DIRECTORY;
    }

    if (options.args) {
      options.args.forEach(function (arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);
    var originalOutput = getJsonOutput('scss-lint', args, {
      cwd: cwd
    });

    /**
     * Original JSON output needs to be transformed so it can be used with the
     * default renderer & tooltip.
     */
    originalOutput
      .then(function (output) {
        var errors = (output[files[0]] || []).map(function (error) {
          return {
            hinttype: 'scss',
            file: files[0],
            line: error.line,
            column: error.column,
            evidence: error.evidence || '',
            message: error.reason +
                (error.linter ? ' (' + error.linter + ')' : ''),
            rule: error.code
          };
        });
        def.resolve(errors);
      }, def.reject)
      .done();
    return def.promise;
  }
};
