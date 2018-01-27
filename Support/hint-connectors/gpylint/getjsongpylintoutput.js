/* eslint no-console: 0 */

/**
 * This runner executes a linter process and collects the output from stdout.
 * The expected output from the linter is JSON that can be parsed by the
 * renderer.
 */
const Q = require('q');
const cp = require('child_process');
const path = require('path');


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
    console.log(`<br>Error executing linter. Is ${runnable} installed?`);
    console.log(`<br>Linter: ${runnable}`);
    console.log(`<br>Args: ${args}`);
    console.log(`<br>Options: ${options}`);
    console.log(`<br>Error ${e}`);
    def.resolve([]);
  });

  proc.stdout.on('data', function(data) {
    error = error + data;
  });

  proc.on('close', function() {
    const fileRegex = new RegExp(/\*+\sFile\s(.*)/);
    const errorRegex = new RegExp(/(\w\d+):\s{0,}(\d+):\s?(.*)/);
    const lines = error.match(/^.*((\r\n|\n|\r)|$)/gm);

    let errorObject = {};
    let errors = [];
    let file;
    let lastError = {message: ''};

    try {
      if (!file) {
        file = fileRegex.exec(lines[0].trim())[1];
        lines.shift();
      }
    } catch (e) {
      let jsonData = [{
        messages: [{
          message: `Error running ${runnable}:<br>
             <br>
             ${file}.<br>
             <br>
             ${e}`.replace('\n', '<br>'),
        }],
      }];

      def.resolve(e);
    }

    let err = {};
    lines.forEach((line, index, lines) => {
      let lineMatches = errorRegex.exec(line);
      if (lineMatches) {
        // new error
        err.message = `${lineMatches[1]}: ${lineMatches[3]}`;
        err.line = Number.parseInt(lineMatches[2], 10);
        err.hinttype = 'gpylint';
        err.file = path.join(options.cwd, file);
        // look ahead for output
        let nextLine = lines[index + 1];
        if (nextLine) {
          let lookahead = errorRegex.exec(nextLine);
          if (!lookahead) {
            for (var i = index; i < lines.length; i++) {
              let lookaheadLine = lines[i];
              errorLine = errorRegex.exec(lookaheadLine)
              if (errorLine) {
                break;
              } else {
                if (!err.evidence) {
                  err.evidence = lookaheadLine;
                } else {
                  err.evidence
                }
              }
            }
          }
        }
        errors.push(err)
        err = {}
      }
    });
    def.resolve(errors);
  });

  return def.promise;
};


