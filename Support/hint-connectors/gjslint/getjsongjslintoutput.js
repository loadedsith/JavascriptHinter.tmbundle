/**
 * This runner executes a linter process and collects the output from stdout.
 * The expected output from the linter is JSON that can be parsed by the
 * renderer.
 */
var Q = require('q'),
  cp = require('child_process');


/**
 * Get the json output from the linter.
 *
 * @param {String} runnable - Name of the executable to run
 * @param {Array} args - Command line arguments to pass
 * @param {Object} options - Options to set on process.spawn
 * @return {Q.Promise} Returns a promise that is resolved when executable
 *   finishes running
 */
module.exports = function (runnable, args, options) {
  var def = Q.defer();
  var error = '';
  var proc = cp.spawn(runnable, args, options || {});
  proc.stdout.on('data', function (data) {
    error = error + data;
  });

  proc.on('close', function () {
    var errors = [];
    var fileRegex = new RegExp(/.*?(\/.*)\ -{5}/);
    var errorRegex = new RegExp(/^Line (\d+), E:([^:]+): (.+)$/gm);

    var lines = error.match(/^.*((\r\n|\n|\r)|$)/gm);
    var errorObject = {};
    var lastError = {message: ''};
    var match = true;//init true to ignore the file line
    var file;

    try {
      if (!file) {
        file = fileRegex.exec(lines[0])[1];
      }
    } catch (e) {

    }

    for (var line of lines) {
      var lineMatches;
      // we want to keep building the error object until another lineMatch.
      while (lineMatches = errorRegex.exec(line)) {
        errorObject = {
          file: file,
          hinttype: 'gjslint',
          column: null,
          evidence: '',
          line: parseInt(lineMatches[1]),
          message: lineMatches[3],
          error: 'E:' + lineMatches[2],
          ready: false
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


