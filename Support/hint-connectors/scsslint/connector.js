/**
 * JavascriptHinter - scss-lint connector
 *
 * Runs the installed scss-lint version with the default JSON reporter and
 * parses the output into a JS object.
 */
const path = require('path');
const getJsonOutput = require('../helpers/getjsonoutput');
const Q = require('q');


/**
 * JavaScriptHinter for TextMate plugin for scss-lint.
 * @type {tmJavaScriptHinter.plugin}
 */
module.exports = {
  extensions: ['.scss'],
  name: 'scsslint',
  /**
   * Processes the files using scss-lint.
   * @param {Array} files Array of files to check with the specified linter
   * @param {Object} options Configuration options for the current linter.
   * @return {Q.Promise} Returns a promise that is resolved when the output is
   * parsed to a JS object.
   */
  process: function(files, options) {
    let def = Q.defer();
    let cwd = path.dirname(files[0]);
    let args = ['--format', 'JSON'];

    if (process.env.TM_PROJECT_DIRECTORY) {
      cwd = process.env.TM_PROJECT_DIRECTORY;
    }

    if (options.args) {
      options.args.forEach(function(arg) {
        args.push(arg);
      });
    }

    args = args.concat(files);
    let originalOutput = getJsonOutput('scss-lint', args, {cwd: cwd});

    /**
     * Original JSON output needs to be transformed so it can be used with the
     * default renderer & tooltip.
     */
    originalOutput
      .then(function(output) {
        let errors = [];

        let fileErrors = output.map(function(file) {

          console.log('file', file);
          return file.messages.map(function(error) {
              return {
                column: error.column,
                evidence: 'goo' + error.evidence || 'foo',
                file: files[0],
                hinttype: 'scss',
                line: 'goos'+error.line,
                message: error.reason +
                    (error.linter ? ' (' + error.linter + ')' : ''),
                rule: error.code,
              };
            })
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
