/* eslint no-console: 0 */

/**
 * This runner executes a linter process and collects the output from stdout.
 * The expected output from the linter is JSON that can be parsed by the
 * renderer.
 */
const Q = require('q');
const cp = require('child_process');


/**
 * Get the json output from the linter.
 *
 * @param {string} runnable - Name of the executable to run
 * @param {Array} args - Command line arguments to pass
 * @param {Object} options - Options to set on process.spawn
 * @return {Q.Promise} Returns a promise that is resolved when executable
 *   finishes running
 */
module.exports = function(runnable, args, options) {
  const def = Q.defer();
  let error = '';
  const proc = cp.spawn(runnable, args, options || {});

  proc.on('error', function(e) {
    console.log('<br>error executing linter. Is ' + runnable + 'installed?');
    console.log('<br>Linter: ', runnable);
    console.log('<br>args', args);
    console.log('<br>options', options);
    console.log('<br>Error', e);
    def.resolve([]);
  });

  proc.stdout.on('data', function(data) {
    error = error + data;
  });

  proc.on('close', function() {
    const fileRegex = new RegExp(/.*?(\/.*)\ -{5}/);
    const errorRegex = new RegExp(/^Line (\d+), E:([^:]+): (.+)$/gm);
    const lines = error.match(/^.*((\r\n|\n|\r)|$)/gm);

    let errorObject = {};
    let errors = [];
    let file;
    let lastError = {message: ''};
    // Init true to ignore the file line.
    let match = true;

    try {
      if (!file) {
        file = fileRegex.exec(lines[0])[1];
      }
    } catch (e) {
      throw new Error(e);
    }

    for (let line of lines) {
      let lineMatches;

      while ((lineMatches = errorRegex.exec(line))) {
        // We want to keep building the error object until another lineMatch.
        errorObject = {
          column: null,
          error: 'E:' + lineMatches[2],
          evidence: '',
          file: file,
          hinttype: 'gjslint',
          line: parseInt(lineMatches[1]),
          message: lineMatches[3],
          ready: false,
        };
        errors.push(errorObject);
        lastError = errorObject;
        match = true;
      }
      if (!match) {
        lastError.message = lastError.message + ' ' + line;
      }
      match = false;
    }

    def.resolve(errors);
  });

  return def.promise;
};


